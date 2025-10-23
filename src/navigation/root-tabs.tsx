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

const tabBarActiveTintColor = '#007AFF';
const tabBarInactiveTintColor = 'gray';

const ICONS: Record<
  keyof RootTabParamList,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  Home: { active: 'home', inactive: 'home-outline' },
  ExercisesTab: { active: 'list', inactive: 'list-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export default function RootTabs() {
  return (
    <Tab.Navigator
      initialRouteName="ExercisesTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const { active, inactive } = ICONS[route.name];
          const name = focused ? active : inactive;
          return <Ionicons name={name} size={size} color={color} />;
        },
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="ExercisesTab"
        component={ExercisesStack}
        options={{ title: 'Exercises' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
