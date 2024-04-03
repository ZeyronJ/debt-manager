import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Button,
} from 'react-native';
import Layout from '../components/Layout';
import Boton from '../components/Boton';
import React, { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const Debtor = ({ navigation, route }) => {
  const db = SQLite.openDatabase('debts.db');

  const [debt, setDebt] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [newImagePath, setNewImagePath] = useState(null);
  const [newAudioPath, setNewAudioPath] = useState(null);

  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      console.log('route.params.id:', route.params.id);
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM debts WHERE id = ?',
          [route.params.id],
          (txObj, resultSet) => {
            setDebt(resultSet.rows._array[0]);
            if (resultSet.rows._array[0].image) {
              setNewImagePath(resultSet.rows._array[0].image);
            }
            if (resultSet.rows._array[0].audio) {
              setNewAudioPath(resultSet.rows._array[0].audio);
            }
            setIsLoading(false);
          }
        ),
          (txObj, error) => console.log(error);
      });

      return () => {
        // Lógica de limpieza si es necesario
      };
    }, [])
  );

  if (isLoading) {
    return (
      <Layout>
        <Text>Cargando...</Text>
      </Layout>
    );
  }

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      // console.log(ImagePicker.MediaTypeOptions);

      if (result.canceled) {
        console.log('Selección de imagen cancelada.');
        return; // Salir de la función si la selección se cancela
      }

      let imageName = `${route.params.id}.jpg`;
      setNewImagePath(`${FileSystem.documentDirectory}${imageName}`);
      setDebt({ ...debt, image: result.assets[0].uri });
    } catch (error) {
      console.log('Error al seleccionar la imagen:', error);
    }
  };

  const updateDebt = async () => {
    // Copia la imagen a la carpeta de documentos de la app
    if (debt.image != null && newImagePath != null) {
      await FileSystem.moveAsync({
        from: debt.image,
        to: newImagePath,
      });
      console.log('imagen guardada');
    }
    // Copia el audio a la carpeta de documentos de la app
    if (debt.audio != null && newAudioPath != null) {
      await FileSystem.moveAsync({
        from: debt.audio,
        to: newAudioPath,
      });
      console.log('audio guardado');
    }

    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE debts SET amount = ?, audio = ?, description = ?, image = ?, thing = ?, created_at = ? WHERE id = ?',
        [
          debt.amount,
          debt.audio ? newAudioPath : null,
          debt.description,
          newImagePath ? newImagePath : null,
          debt.thing,
          debt.created_at,
          route.params.id,
        ],
        (txObj, resultSet) => {
          navigation.navigate('Home');
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  async function startRecording() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status === 'granted') {
        const newRecording = new Audio.Recording();
        await newRecording.prepareToRecordAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setIsRecording(true);
        await newRecording.startAsync(); // grabando audio
        setRecording(newRecording); // guardando el objeto de grabación
      } else {
        console.log('Permission to access audio denied');
      }
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  }

  async function stopRecording() {
    if (recording) {
      await recording.stopAndUnloadAsync();
      setIsRecording(false);

      // Guardar el archivo de audio en una dirección específica
      const audioName = `${route.params.id}.aac`;
      setNewAudioPath(`${FileSystem.documentDirectory}${audioName}`);
      setDebt({ ...debt, audio: recording.getURI() });
    }
  }

  async function playRecording() {
    if (!debt.audio) {
      return;
    }
    const { sound, status } = await Audio.Sound.createAsync({
      uri: debt.audio,
    });
    if (status.isLoaded) {
      await sound.playAsync();
    }
    // if (recording) {
    //   const { sound, status } = await recording.createNewLoadedSoundAsync();
    //   if (status.isLoaded) {
    //     await sound.playAsync();
    //   }
    // }
  }

  return (
    <Layout>
      <View className='flex flex-row w-full'>
        <View className='w-1/2'>
          <TextInput
            className='mt-4 px-1 w-28 mx-auto border-b border-neutral-400 font-medium'
            placeholder='Monto'
            selectionColor={'black'}
            onChangeText={(text) => setDebt({ ...debt, amount: text })}
            value={debt.amount.toString()}
            keyboardType='numeric'
          />
          <TextInput
            className='mt-2 px-1 w-28 mx-auto border-b border-neutral-400 font-medium'
            placeholder='Cosa'
            placeholderTextColor={'hsl(0,0%,65%)'}
            selectionColor={'black'}
            onChangeText={(text) => setDebt({ ...debt, thing: text })}
            value={debt.thing !== 'No especificado' ? debt.thing : ''}
          />
          <TextInput
            className='my-2 px-1 w-28 mx-auto border-b border-neutral-400 font-medium'
            placeholder='Fecha'
            selectionColor={'black'}
            onChangeText={(text) => setDebt({ ...debt, created_at: text })}
            value={debt.created_at}
          />
        </View>
        {!debt.audio && (
          <View className='w-1/2 flex-1 items-center justify-center'>
            <Boton
              text={isRecording ? 'Parar Audio' : 'Grabar Audio'}
              color='hsl(0,0%,50%)'
              onPress={isRecording ? stopRecording : startRecording}
            />
          </View>
        )}
        {debt.audio && (
          <View className='w-1/2 flex-1 items-center justify-center'>
            <Boton
              text='Audio'
              color='hsl(210,80%,50%)'
              onPress={playRecording}
            />
          </View>
        )}
      </View>

      <TextInput
        className='bg-white mt-1 mb-4 p-2 w-full h-40 text-center rounded-xl border border-gray-200'
        style={{ textAlignVertical: 'top' }}
        multiline={true}
        placeholder='Descripcion'
        placeholderTextColor={'hsl(0,0%,65%)'}
        selectionColor={'black'}
        onChangeText={(text) => setDebt({ ...debt, description: text })}
        value={debt.description !== 'No especificado' ? debt.description : ''}
        onTouchStart={() => {
          if (debt.description == 'No especificado') {
            setDebt({ ...debt, description: '' });
          }
        }}
      />
      {!debt.image && (
        <Boton
          text='Subir imagen'
          color='hsl(0,0%,50%)'
          onPress={() => {
            pickImage();
          }}
        />
      )}
      {debt.image && (
        <View className='w-full h-80 mt-4 bg-black'>
          <Image
            source={{
              uri: debt.image,
            }}
            style={{
              flex: 1,
              resizeMode: 'contain',
            }}
          />
          {/* {console.log(imagen)} */}
        </View>
      )}
      <TouchableOpacity
        className='bg-green-500 rounded-lg py-2 px-12 mt-3'
        onPress={() => {
          updateDebt();
        }}
      >
        <Text className='text-white text-lg font-semibold'>Guardar</Text>
      </TouchableOpacity>
      {/* <Image
        source={require('../../assets/favicon.png')}
        className='w-full h-96 bg-green-500'
      /> */}
    </Layout>
  );
};

export default Debtor;
