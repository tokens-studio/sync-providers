import type { ThemeGroupOption } from "./ThemeGroupOption.js";

export interface ThemeGroup {
  id: string;
  name: string;
  options: ThemeGroupOption[];
}
