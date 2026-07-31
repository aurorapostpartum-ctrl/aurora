import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, Text } from '../src/components/ui';
import { colors, spacing } from '../src/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <View style={styles.container}>
          <Text variant="title1" style={styles.title}>
            Page not found
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.message}>
            The screen you’re looking for doesn’t exist.
          </Text>
          <Link href="/" asChild>
            <Button label="Go Home" variant="secondary" fullWidth={false} style={styles.button} />
          </Link>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    marginBottom: spacing.xs,
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    minWidth: 160,
  },
});
