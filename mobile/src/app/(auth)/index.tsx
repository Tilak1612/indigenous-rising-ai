import { Redirect } from 'expo-router';

// Signed-out entry point. The root Stack guards (tabs) — which owns "/" —
// behind a session, so this group needs its own "/" or the launch URL has
// nothing to match before the user signs in.
export default function AuthIndex() {
  return <Redirect href="/(auth)/sign-in" />;
}
