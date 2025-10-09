import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/home';
import ProfileScreen from '../screens/profile';
import ExercisesStack from './exercises-stack';

export type RootTabParamList = {
  Home: undefined;
  ExercisesTab: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function RootTabs() {
  return (
    <Tab.Navigator
      initialRouteName="ExercisesTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let name: keyof typeof Ionicons.glyphMap = 'ellipse';

          if (route.name === 'Home') {
            name = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ExercisesTab') {
            name = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            name = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={name} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="ExercisesTab" component={ExercisesStack} options={{ title: 'Exercises' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
