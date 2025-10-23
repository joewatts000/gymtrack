import { JSX } from 'react';
import Screen from '../components/Screen';
import { Title, Subtitle } from '../components/Typography';

export default function ProfileScreen(): JSX.Element {
  return (
    <Screen>
      <Title>Profile</Title>
      <Subtitle accessibilityLabel="Profile description">User settings, preferences and account.</Subtitle>
    </Screen>
  );
}
