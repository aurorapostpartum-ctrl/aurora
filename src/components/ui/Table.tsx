import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { colors, radius, spacing } from '../../theme';
import { EmptyState } from './EmptyState';
import { Text } from './Text';

export interface TableColumn<T> {
  key: string;
  label: string;
  width?: number;
  flex?: number;
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => React.ReactNode;
  cellText?: (row: T) => string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  onRowPress?: (row: T) => void;
  emptyMessage?: string;
}

export function Table<T>({ columns, data, keyExtractor, onRowPress, emptyMessage = 'Nothing here yet' }: TableProps<T>) {
  const { isMobile } = useBreakpoint();

  if (data.length === 0) {
    return <EmptyState icon="grid-outline" title={emptyMessage} />;
  }

  if (isMobile) {
    return (
      <View>
        {data.map((row, index) => (
          <RowRenderer
            key={keyExtractor(row, index)}
            row={row}
            onPress={onRowPress}
            style={styles.stackedCard}
          >
            {columns.map((col) => (
              <View key={col.key} style={styles.stackedLine}>
                <Text variant="caption1" color={colors.textTertiary} style={styles.stackedLabel}>
                  {col.label}
                </Text>
                <View style={styles.stackedValue}>
                  {col.render ? col.render(row) : <Text variant="subhead">{col.cellText?.(row) ?? ''}</Text>}
                </View>
              </View>
            ))}
          </RowRenderer>
        ))}
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          {columns.map((col) => (
            <View key={col.key} style={[styles.cell, colStyle(col)]}>
              <Text variant="caption1" color={colors.textTertiary} style={alignStyle(col.align)}>
                {col.label.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
        {data.map((row, index) => (
          <RowRenderer key={keyExtractor(row, index)} row={row} onPress={onRowPress} style={styles.bodyRow}>
            {columns.map((col) => (
              <View key={col.key} style={[styles.cell, colStyle(col)]}>
                {col.render ? (
                  col.render(row)
                ) : (
                  <Text variant="subhead" style={alignStyle(col.align)} numberOfLines={1}>
                    {col.cellText?.(row) ?? ''}
                  </Text>
                )}
              </View>
            ))}
          </RowRenderer>
        ))}
      </View>
    </ScrollView>
  );
}

function RowRenderer<T>({
  row,
  onPress,
  style,
  children,
}: {
  row: T;
  onPress?: (row: T) => void;
  style: object;
  children: React.ReactNode;
}) {
  if (!onPress) {
    return <View style={style}>{children}</View>;
  }
  return (
    <Pressable onPress={() => onPress(row)} style={style}>
      {children}
    </Pressable>
  );
}

function colStyle<T>(col: TableColumn<T>) {
  if (col.width) return { width: col.width };
  return { flex: col.flex ?? 1 };
}

function alignStyle(align?: 'left' | 'right' | 'center') {
  if (!align || align === 'left') return undefined;
  return { textAlign: align } as const;
}

const styles = StyleSheet.create({
  table: {
    minWidth: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  cell: {
    paddingRight: spacing.md,
    justifyContent: 'center',
  },
  stackedCard: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  stackedLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  stackedLabel: {
    marginRight: spacing.sm,
  },
  stackedValue: {
    flexShrink: 1,
    alignItems: 'flex-end',
  },
});
