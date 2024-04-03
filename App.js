import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/screens/Home';
import Debtor from './src/screens/Debtor';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <>
      <StatusBar style='auto' />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            animation: 'none',
            headerStyle: {
              backgroundColor: 'white', // Cambia el color del fondo del encabezado
            },
            headerTintColor: 'hsl(0,0%,25%)', // Cambia el color del texto del encabezado
            headerTitleStyle: {
              fontWeight: 'bold', // Cambia el estilo del texto del encabezado
            },
            headerTitleAlign: 'center', // Centra el texto del encabezado
          }}
        >
          <Stack.Screen
            name='Home'
            component={Home}
            options={{ title: '' }} // Cambia el título del encabezado
          />
          <Stack.Screen
            name='Debtor'
            component={Debtor}
            options={({ route }) => ({
              title: route.params?.debtor,
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
