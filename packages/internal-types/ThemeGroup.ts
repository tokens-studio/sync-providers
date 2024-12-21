import type { ThemeOption } from "./ThemeOption";

export interface ThemeGroup {
  id: string;
  name: string;
  options: ThemeOption[];
}
