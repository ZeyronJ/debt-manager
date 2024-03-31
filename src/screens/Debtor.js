import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Layout from '../components/Layout';
import Boton from '../components/Boton';
import React, { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const Debtor = ({ navigation, route }) => {
  const db = SQLite.openDatabase('example.db');

  const [debt, setDebt] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [uri, setUri] = useState(null);
  const [newPath, setNewPath] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM debts WHERE id = ?',
          [route.params.id],
          (txObj, resultSet) => {
            console.log(resultSet.rows._array);
            setDebt(resultSet.rows._array[0]);
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

      console.log(ImagePicker.MediaTypeOptions);

      // console.log(result);;;; da error xddd
      // {"assets": [{"assetId": null, "base64": null, "duration": null, "exif": null, "height": 421, "rotation": null,
      // "type": "image", "uri": "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540zeyron%252Fdebtmanager/ImagePicker/fe1c8ecf-e1f6-4956-91f2-f32326840141.jpeg",
      // "width": 562}], "canceled": false, "cancelled": false}

      if (result.canceled) {
        console.log('Selección de imagen cancelada.');
        return; // Salir de la función si la selección se cancela
      }

      setUri(result.assets[0].uri);
      let imageName = `${route.params.id}.jpg`;
      setNewPath(`${FileSystem.documentDirectory}${imageName}`);
      setDebt({ ...debt, image: result.assets[0].uri });
    } catch (error) {
      console.log('Error al seleccionar la imagen:', error);
    }
  };

  const updateDebt = async (debt) => {
    console.log('GUARDANDO');
    if (newPath == null) {
      db.transaction((tx) => {
        tx.executeSql(
          'UPDATE debts SET amount = ?, audio = ?, description = ?, thing = ? WHERE id = ?',
          [debt.amount, null, debt.description, debt.thing, route.params.id],
          (txObj, resultSet) => {
            console.log(uri, newPath);
          },
          (txObj, error) => console.log(error)
        );
      });
    } else {
      db.transaction((tx) => {
        tx.executeSql(
          'UPDATE debts SET amount = ?, audio = ?, description = ?, image = ?, thing = ? WHERE id = ?',
          [
            debt.amount,
            null,
            debt.description,
            newPath,
            debt.thing,
            route.params.id,
          ],
          (txObj, resultSet) => {
            console.log(uri, newPath);
          },
          (txObj, error) => console.log(error)
        );
      });
    }

    // Move the image to the document directory
    if (uri != null && newPath != null) {
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });
    }
    console.log('GUARDANDO FIN');
  };

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
            <Boton
              text='Subir audio'
              color='hsl(0,0%,30%)'
              onPress={() => {
                console.log('audioooo');
              }}
            />
          </View>
        )}
        {debt.audio && (
          <View className='w-1/2'>
            <Text className='text-white mx-auto'>AUDIO</Text>
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
          updateDebt(debt);
          navigation.navigate('Home');
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
