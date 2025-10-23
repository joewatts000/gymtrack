import { JSX } from 'react';
import Screen from '../components/Screen';
import { Title, Subtitle } from '../components/Typography';

export default function HomeScreen(): JSX.Element {
  return (
    <Screen>
      <Title>Home</Title>
      <Subtitle accessibilityLabel="Welcome line 1">Simple, free gym tracker.</Subtitle>
      <Subtitle accessibilityLabel="Welcome line 2">Log workouts quickly.</Subtitle>
      <Subtitle accessibilityLabel="Welcome line 3">No ads, no fuss, no nonsense.</Subtitle>
    </Screen>
  );
}
