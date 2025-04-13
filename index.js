import { registerRootComponent } from 'expo';
import App from './App';
import { useFonts } from 'expo-font'; // Import useFonts

// It's generally recommended to load fonts at the root
// but current setup in App.js handles async operations well.
// If font loading issues arise, move font loading logic here or App.js.

// Example if fonts needed loading *before* App registers:
/*
const LoadFonts = () => {
  const [fontsLoaded] = useFonts({
    'RobotoMono-Regular': require('./assets/fonts/RobotoMono-Regular.ttf'),
    'RobotoMono-Bold': require('./assets/fonts/RobotoMono-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Or a loading indicator
  }

  return <App />;
};

registerRootComponent(LoadFonts);
*/

// Current setup: App handles its own loading state (SplashScreen)
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);