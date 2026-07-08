import { Redirect } from 'expo-router';

export default function Index() {
  // On native platforms, we don't show the web landing page, so we redirect straight to login (or tabs).
  return <Redirect href="/login" />;
}
