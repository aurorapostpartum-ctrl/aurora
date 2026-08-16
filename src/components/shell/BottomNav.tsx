import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router, usePathname } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../ui';
import type { NavItem } from '../../navigation/navConfig';
import { colors, spacing } from '../../theme';

export interface BottomNavProps {
  items: NavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const handlePress = (href: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push(href as never);
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom || spacing.xs, height: 56 + (insets.bottom || spacing.xs) }]}>
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.row}>
        {items.map((item) => {
          const cleaned = item.href.replace('/(app)/(shell)', '') || '/';
          const active = pathname === cleaned || pathname.startsWith(`${cleaned}/`);
          return (
            <Pressable key={item.key} onPress={() => handlePress(item.href)} style={styles.item}>
              <Ionicons
                name={active ? item.iconActive : item.icon}
                size={22}
                color={active ? colors.accentStrong : colors.textTertiary}
              />
              <Text variant="caption2" color={active ? colors.accentStrong : colors.textTertiary} style={styles.label}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    backgroundColor: Platform.OS === 'android' ? colors.backgroundElevated : 'transparent',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: spacing.xs,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    marginTop: 2,
  },
});
