import { JSX } from 'react';
import Screen from '../components/screen-view';
import { Title, Subtitle } from '../components/typography-components';

export default function ProfileScreen(): JSX.Element {
  return (
    <Screen>
      <Title>Profile</Title>
      <Subtitle accessibilityLabel="Profile description">User settings, preferences and account.</Subtitle>
    </Screen>
  );
}
