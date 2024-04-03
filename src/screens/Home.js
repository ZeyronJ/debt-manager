import React, { useState, version } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Layout from '../components/Layout';
import { TextInput, Text } from 'react-native';
import Boton from '../components/Boton';
import DebtList from '../components/DebtList';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

const Home = ({ navigation }) => {
  const db = SQLite.openDatabase('debts.db');
  const [isLoading, setIsLoading] = useState(true);

  const [deudor, setDeudor] = useState('');
  const [monto, setMonto] = useState('');
  const [debts, setDebts] = useState([]);
  useFocusEffect(
    React.useCallback(() => {
      // db.transaction((tx) => {
      //   tx.executeSql('DROP TABLE IF EXISTS debts');
      // });
      console.log('entre');
      db.transaction((tx) => {
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS debts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            debtor TEXT NOT NULL,
            amount REAL NOT NULL,
            thing TEXT NOT NULL DEFAULT 'No especificado',
            description TEXT NOT NULL DEFAULT 'No especificado',
            created_at DATE DEFAULT (DATE('now', 'localtime')),
            audio TEXT,
            image TEXT
          )
        `);
      });

      db.transaction((tx) => {
        tx.executeSql('SELECT * FROM debts', null, (txObj, resultSet) => {
          setDebts(resultSet.rows._array);
          setIsLoading(false);
        }),
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

  const createDebt = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO debts (debtor, amount) values (?, ?)',
        [deudor, monto],
        (txObj, resultSet) => {
          const currentDate = new Date();
          const formattedDate = currentDate.toISOString().split('T')[0];
          // console.log(formattedDate);
          setDebts([
            ...debts,
            {
              id: resultSet.insertId,
              debtor: deudor,
              amount: monto,
              thing: 'No especificado',
              created_at: formattedDate,
            },
          ]);
          setDeudor('');
          setMonto('');
        },
        (txObj, error) => console.log(error)
      );
    });
  };
  const deleteDebt = (id) => {
    db.transaction((tx) => {
      // Eliminar archivos de audio e imagen
      tx.executeSql(
        'SELECT * FROM debts WHERE id = ?',
        [id],
        async (txObj, resultSet) => {
          const debt = resultSet.rows._array[0];
          if (debt.audio) {
            await FileSystem.deleteAsync(debt.audio);
            console.log('Audio eliminado:', debt.audio);
          }
          if (debt.image) {
            await FileSystem.deleteAsync(debt.image);
            console.log('Imagen eliminada:', debt.image);
          }
        },
        (txObj, error) => console.log(error)
      );
      tx.executeSql(
        'DELETE FROM debts WHERE id = ?',
        [id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            setDebts([...debts].filter((debt) => debt.id != id));
          }
          console.log('Deuda eliminada:', id);
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  return (
    <Layout>
      <TextInput
        className='mt-4 px-1 w-20 border-b border-b-neutral-400'
        placeholder='Deudor'
        placeholderTextColor='gray'
        selectionColor={'black'}
        onChangeText={(text) => setDeudor(text)}
        value={deudor}
      />
      <TextInput
        className='px-1 w-20 border-b my-2 border-b-neutral-400'
        placeholder='Monto'
        placeholderTextColor='gray'
        selectionColor={'black'}
        onChangeText={(text) => setMonto(text)}
        value={monto.toString()}
        keyboardType='numeric'
      />
      <Boton
        color={'hsl(210,80%,50%)'}
        text={'Agregar deuda'}
        onPress={() => createDebt()}
      />
      <DebtList debts={debts} deleteDebt={deleteDebt} />
    </Layout>
  );
};

export default Home;
