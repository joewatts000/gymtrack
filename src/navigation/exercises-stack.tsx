import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExercisesList from '../screens/exercise-list';
import ExerciseDetail from '../screens/exercise-detail';
import { colors } from '../theme';

export type ExercisesStackParamList = {
  ExercisesList: undefined;
  ExerciseDetail: { exerciseId: string };
};

const Stack = createNativeStackNavigator<ExercisesStackParamList>();

export default function ExercisesStack() {
  return (
    <Stack.Navigator
      initialRouteName="ExercisesList"
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: colors.darkBlue,
      }}
    >
      <Stack.Screen
        name="ExercisesList"
        component={ExercisesList}
        options={{ title: 'Exercises' }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetail}
        options={{ title: 'Exercise', headerBackTitle: 'All' }}
      />
    </Stack.Navigator>
  );
}
