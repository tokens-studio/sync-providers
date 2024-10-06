import type { ThemeGroupOption } from "./ThemeGroupOption.js";

export interface ThemeGroup {
  urn: string;
  name: string;
  options: ThemeGroupOption[];
}
