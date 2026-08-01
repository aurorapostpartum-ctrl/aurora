export interface CodeEntry {
  id: string;
  title: string;
  explanation: string;
  sectionRef: string;
  codeBook: string;
  trade: string;
  province: string;
  year: string;
  keywords: string[];
}

export interface SearchFilters {
  province: string | null;
  trade: string | null;
  codeBook: string | null;
  year: string | null;
}

export const EMPTY_FILTERS: SearchFilters = {
  province: null,
  trade: null,
  codeBook: null,
  year: null,
};
