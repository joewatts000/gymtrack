// App.tsx
import 'react-native-gesture-handler'; // keep this at the very top
import 'react-native-get-random-values'; // if you're using uuid (only if you added this)
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootTabs from './src/navigation/root-tabs';

export default function App() {
  return (
    // GestureHandlerRootView must be above any gesture-handler components
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <RootTabs />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
