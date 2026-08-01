import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Text } from '../../components/ui';
import type { DocumentCategory, DocumentFileType } from '../../types/domain';

export const SHEET_WIDTH = 760;
export const SHEET_HEIGHT = 980;

const BLUEPRINT_BG = '#132335';
const BLUEPRINT_LINE = 'rgba(158, 200, 235, 0.22)';
const BLUEPRINT_LINE_STRONG = 'rgba(158, 200, 235, 0.4)';
const BLUEPRINT_INK = 'rgba(226, 240, 250, 0.92)';

interface DrawingSheetProps {
  jobName: string;
  documentTitle: string;
  category: DocumentCategory;
  fileType: DocumentFileType;
  revisionNumber: number;
  pageLabel: string;
  pageNumber: number;
  pageCount: number;
}

// A believable mock of a construction print, since there's no real file
// storage behind this demo. Grid + a few deterministic "room" outlines
// stand in for CAD content; the title block layout mirrors a real sheet.
export function DrawingSheet({
  jobName,
  documentTitle,
  category,
  fileType,
  revisionNumber,
  pageLabel,
  pageNumber,
  pageCount,
}: DrawingSheetProps) {
  const seed = pageNumber * 37;
  const rooms = buildRooms(seed);
  const isImage = fileType === 'image';

  return (
    <View style={styles.sheet}>
      <GridLines />

      {!isImage ? (
        <>
          {rooms.map((room, i) => (
            <View
              key={i}
              style={[
                styles.room,
                { left: room.x, top: room.y, width: room.w, height: room.h },
              ]}
            />
          ))}
          <View style={styles.northArrow}>
            <Ionicons name="navigate-outline" size={20} color={BLUEPRINT_INK} />
            <Text variant="caption2" color={BLUEPRINT_INK} style={styles.northLabel}>
              N
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.photoPlaceholder}>
          <Ionicons name="image-outline" size={48} color={BLUEPRINT_LINE_STRONG} />
        </View>
      )}

      <View style={styles.border} pointerEvents="none" />

      <View style={styles.titleBlock}>
        <Text variant="caption1" color={BLUEPRINT_INK} numberOfLines={1} style={styles.titleBlockJob}>
          {jobName.toUpperCase()}
        </Text>
        <Text variant="headline" color={BLUEPRINT_INK} numberOfLines={2} style={styles.titleBlockDoc}>
          {documentTitle}
        </Text>
        <View style={styles.titleBlockDivider} />
        <View style={styles.titleBlockRow}>
          <View>
            <Text variant="caption2" color={BLUEPRINT_LINE_STRONG}>
              SHEET
            </Text>
            <Text variant="subhead" color={BLUEPRINT_INK}>
              {pageLabel}
            </Text>
          </View>
          <View>
            <Text variant="caption2" color={BLUEPRINT_LINE_STRONG}>
              PAGE
            </Text>
            <Text variant="subhead" color={BLUEPRINT_INK}>
              {pageNumber} of {pageCount}
            </Text>
          </View>
          <View>
            <Text variant="caption2" color={BLUEPRINT_LINE_STRONG}>
              REV
            </Text>
            <Text variant="subhead" color={BLUEPRINT_INK}>
              {revisionNumber}
            </Text>
          </View>
          <View>
            <Text variant="caption2" color={BLUEPRINT_LINE_STRONG}>
              DISCIPLINE
            </Text>
            <Text variant="subhead" color={BLUEPRINT_INK} numberOfLines={1}>
              {category}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function buildRooms(seed: number) {
  const rand = mulberry32(seed);
  const count = 3 + Math.floor(rand() * 3);
  const rooms: { x: number; y: number; w: number; h: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    const w = 120 + rand() * 180;
    const h = 90 + rand() * 160;
    const x = 60 + rand() * (SHEET_WIDTH - w - 120);
    const y = 140 + rand() * (SHEET_HEIGHT - h - 320);
    rooms.push({ x, y, w, h });
  }
  return rooms;
}

function mulberry32(a: number) {
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function GridLines() {
  const spacing = 40;
  const cols = Math.floor(SHEET_WIDTH / spacing);
  const rows = Math.floor(SHEET_HEIGHT / spacing);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <View
          key={`v-${i}`}
          style={[
            styles.gridLineV,
            { left: i * spacing, backgroundColor: i % 5 === 0 ? BLUEPRINT_LINE_STRONG : BLUEPRINT_LINE },
          ]}
        />
      ))}
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <View
          key={`h-${i}`}
          style={[
            styles.gridLineH,
            { top: i * spacing, backgroundColor: i % 5 === 0 ? BLUEPRINT_LINE_STRONG : BLUEPRINT_LINE },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    width: SHEET_WIDTH,
    height: SHEET_HEIGHT,
    backgroundColor: BLUEPRINT_BG,
    overflow: 'hidden',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  room: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: BLUEPRINT_INK,
    backgroundColor: 'rgba(226,240,250,0.04)',
  },
  northArrow: {
    position: 'absolute',
    top: 32,
    right: 32,
    alignItems: 'center',
  },
  northLabel: {
    marginTop: 2,
  },
  photoPlaceholder: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -60,
    marginLeft: -60,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: BLUEPRINT_LINE_STRONG,
    borderStyle: 'dashed',
  },
  border: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    bottom: 16,
    borderWidth: 2,
    borderColor: BLUEPRINT_LINE_STRONG,
  },
  titleBlock: {
    position: 'absolute',
    left: 32,
    right: 32,
    bottom: 32,
    padding: 16,
    borderWidth: 1.5,
    borderColor: BLUEPRINT_LINE_STRONG,
    backgroundColor: 'rgba(19,35,53,0.92)',
  },
  titleBlockJob: {
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  titleBlockDoc: {
    marginBottom: 10,
  },
  titleBlockDivider: {
    height: 1,
    backgroundColor: BLUEPRINT_LINE_STRONG,
    marginBottom: 10,
  },
  titleBlockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
