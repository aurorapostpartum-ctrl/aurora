import { CODE_DATABASE } from './codeDatabase';
import type { CodeEntry, SearchFilters } from './types';

function matchesFilters(entry: CodeEntry, filters: SearchFilters): boolean {
  if (filters.province && filters.province !== entry.province && entry.province !== 'ALL') {
    return false;
  }
  if (filters.trade && filters.trade !== entry.trade) return false;
  if (filters.codeBook && filters.codeBook !== entry.codeBook) return false;
  if (filters.year && filters.year !== entry.year) return false;
  return true;
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

function tokenScore(entry: CodeEntry, token: string): number {
  let points = 0;
  if (entry.title.toLowerCase().includes(token)) points += 6;
  if (entry.keywords.some((k) => k.includes(token))) points += 5;
  if (entry.sectionRef.toLowerCase().includes(token)) points += 3;
  if (entry.explanation.toLowerCase().includes(token)) points += 1;
  return points;
}

/** Every query word must match something (title/keywords/section/explanation) — this is
 * what makes multi-word queries like "wire gauge" find the entry tagged with both words,
 * instead of only matching a literal "wire gauge" substring. */
function score(entry: CodeEntry, query: string): number {
  const tokens = tokenize(query);
  if (tokens.length === 0) return 0;

  let total = 0;
  for (const token of tokens) {
    const points = tokenScore(entry, token);
    if (points === 0) return 0;
    total += points;
  }

  const title = entry.title.toLowerCase();
  if (title === query) total += 15;
  else if (title.startsWith(query)) total += 8;
  else if (title.includes(query)) total += 4;

  return total;
}

/** Instant, in-memory search — no network round trip, so results are as fast as a keystroke. */
export function searchCodes(query: string, filters: SearchFilters): CodeEntry[] {
  const trimmed = query.trim().toLowerCase();
  const inScope = CODE_DATABASE.filter((entry) => matchesFilters(entry, filters));

  if (!trimmed) return inScope;

  return inScope
    .map((entry) => ({ entry, points: score(entry, trimmed) }))
    .filter((x) => x.points > 0)
    .sort((a, b) => b.points - a.points)
    .map((x) => x.entry);
}
