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

  const [imageUri, setImageUri] = useState(null);
  const [newImagePath, setNewImagePath] = useState(null);

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

      setImageUri(result.assets[0].uri);
      let imageName = `${route.params.id}.jpg`;
      setNewImagePath(`${FileSystem.documentDirectory}${imageName}`);
      setDebt({ ...debt, image: result.assets[0].uri });
    } catch (error) {
      console.log('Error al seleccionar la imagen:', error);
    }
  };

  const updateDebt = async () => {
    // Copia la imagen a la carpeta de documentos de la app
    if (imageUri != null && newImagePath != null) {
      await FileSystem.moveAsync({
        from: imageUri,
        to: newImagePath,
      });
      console.log('archivo guardado');
    }

    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE debts SET amount = ?, audio = ?, description = ?, image = ?, thing = ? WHERE id = ?',
        [
          debt.amount,
          null,
          debt.description,
          newImagePath ? newImagePath : null,
          debt.thing,
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
        setRecording(newRecording);
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
    }
  }

  async function playRecording() {
    if (recording) {
      const { sound, status } = await recording.createNewLoadedSoundAsync();
      if (status.isLoaded) {
        await sound.playAsync();
      }
    }
  }

  return (
    <Layout>
      <View className='flex flex-row w-full'>
        <View className='w-1/2'>
          <TextInput
            className='text-white mt-4 p-1 w-28 mx-auto'
            placeholder='Monto'
            placeholderTextColor='gray'
            selectionColor={'white'}
            onChangeText={(text) => setDebt({ ...debt, amount: text })}
            value={debt.amount.toString()}
            keyboardType='numeric'
          />
          <TextInput
            className='text-white mt-1 p-1 w-28 mx-auto'
            placeholder='Cosa'
            placeholderTextColor='gray'
            selectionColor={'white'}
            onChangeText={(text) => setDebt({ ...debt, thing: text })}
            value={debt.thing}
            onTouchStart={() => {
              if (debt.thing == 'No especificado') {
                setDebt({ ...debt, thing: '' });
              }
            }}
          />
          <TextInput
            className='text-white mt-1 p-1 w-28 mx-auto'
            placeholder='Fecha'
            placeholderTextColor='gray'
            selectionColor={'white'}
            onChangeText={(text) => setDebt({ ...debt, created_at: text })}
            value={debt.created_at}
          />
        </View>
        {!debt.audio && (
          <View className='w-1/2 flex-1 items-center justify-center'>
            <Button
              title={isRecording ? 'Parar Audio' : 'Grabar Audio'}
              color='hsl(0,0%,30%)'
              onPress={isRecording ? stopRecording : startRecording}
            />
            <Button title={'Play'} onPress={playRecording} />
          </View>
        )}
        {debt.audio && (
          <View className='w-1/2'>
            <Button title={'Play'} onPress={playRecording} />
          </View>
        )}
      </View>

      <TextInput
        className='text-white bg-neutral-700 mt-1 mb-4 p-2 w-full h-44 text-center rounded-xl'
        style={{ textAlignVertical: 'top' }}
        multiline={true}
        placeholder='Descripcion'
        placeholderTextColor='hsl(0,0%,70%)'
        selectionColor={'white'}
        onChangeText={(text) => setDebt({ ...debt, description: text })}
        value={debt.description}
        onTouchStart={() => {
          if (debt.description == 'No especificado') {
            setDebt({ ...debt, description: '' });
          }
        }}
      />
      {!debt.image && (
        <Boton
          text='Subir imagen'
          color='hsl(0,0%,30%)'
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
        className='bg-green-700 rounded-lg py-2 px-12 mt-3'
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
