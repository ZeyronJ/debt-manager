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
          }}
        >
          <Stack.Screen name='Home' component={Home}></Stack.Screen>
          <Stack.Screen
            name='Debtor'
            component={Debtor}
            options={({ route }) => ({
              title: route.params?.debtor,
            })}
          ></Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });
