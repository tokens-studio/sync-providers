export interface ThemeOption {
  name: string;
  selectedTokenSets: Record<string, string>;
}

export interface ThemeGroup {
  id: string;
  name: string;
  options: ThemeOption[];
}