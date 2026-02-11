import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors } from './constants/Colors';

import HomeScreen from './screens/HomeScreen';
import AbonadosScreen from './screens/AbonadosScreen';
import SorteosScreen from './screens/SorteosScreen';
import PagosScreen from './screens/PagosScreen';
import AbonadoDetalleScreen from './screens/AbonadoDetalleScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyle: { backgroundColor: Colors.background }
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Lotería Benicolo', headerShown: false }}
        />
        <Stack.Screen
          name="Abonados"
          component={AbonadosScreen}
          options={{ title: 'Abonados' }}
        />
        <Stack.Screen
          name="AbonadoDetalle"
          component={AbonadoDetalleScreen}
          options={{ title: 'Detalle Abonado' }}
        />
        <Stack.Screen
          name="Sorteos"
          component={SorteosScreen}
          options={{ title: 'Sorteos' }}
        />
        <Stack.Screen
          name="Pagos"
          component={PagosScreen}
          options={{ title: 'Pagos' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
