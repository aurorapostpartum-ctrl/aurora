import { TRADES } from '../onboarding/constants';
import { CODE_BOOKS, CODE_DATABASE, CODE_YEARS } from './codeDatabase';
import type { SelectModalOption } from '../../components/ui';

const PROVINCE_NAMES: Record<string, string> = {
  ON: 'Ontario',
  BC: 'British Columbia',
  AB: 'Alberta',
  QC: 'Quebec',
};

export const PROVINCE_FILTER_OPTIONS: SelectModalOption[] = Array.from(
  new Set(CODE_DATABASE.map((entry) => entry.province).filter((p) => p !== 'ALL'))
).map((code) => ({ value: code, label: PROVINCE_NAMES[code] ?? code }));

const TRADE_LABELS: Record<string, string> = Object.fromEntries(
  TRADES.map((t) => [t.id, t.label])
);

export const TRADE_FILTER_OPTIONS: SelectModalOption[] = Array.from(
  new Set(CODE_DATABASE.map((entry) => entry.trade))
).map((id) => ({ value: id, label: TRADE_LABELS[id] ?? id }));

export const CODE_BOOK_FILTER_OPTIONS: SelectModalOption[] = CODE_BOOKS.map((book) => ({
  value: book,
  label: book,
}));

export const YEAR_FILTER_OPTIONS: SelectModalOption[] = CODE_YEARS.map((year) => ({
  value: year,
  label: year,
}));
