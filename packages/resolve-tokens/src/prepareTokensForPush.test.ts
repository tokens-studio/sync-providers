import { expect, test } from "vitest";
import {
  prepareTokensForPush,
  type RemoteTokenStorageMetadata,
} from "./prepareTokensForPush.js";
import type { ThemeObject } from "@tokens-studio/types";
import type { DesignTokens } from "style-dictionary/types";
import { TokenSetStatus } from "@tokens-studio/types";
test("prepareTokensForPush creates correct file structure", () => {
  const tokens: Record<string, DesignTokens> = {
    global: {
      color: {
        primary: { value: "#FF0000" },
      },
    },
    dark: {
      color: {
        background: { value: "#000000" },
      },
    },
  };

  const themes: ThemeObject[] = [
    {
      id: "light",
      name: "light",
      selectedTokenSets: { global: TokenSetStatus.SOURCE },
    },
    {
      id: "dark",
      name: "dark",
      selectedTokenSets: {
        global: TokenSetStatus.SOURCE,
        dark: TokenSetStatus.SOURCE,
      },
    },
  ];

  const metadata: RemoteTokenStorageMetadata = {
    tokenSetOrder: ["global", "dark"],
    tokenSetsData: {
      global: { id: "global", isDynamic: false },
      dark: { id: "dark", isDynamic: true },
    },
  };

  const result = prepareTokensForPush({ tokens, themes, metadata });

  expect(result).toHaveLength(4); // 2 token files + themes + metadata
  expect(result).toContainEqual({
    path: "tokens/global.json",
    name: "global",
    data: JSON.stringify(tokens.global, null, 2),
  });
  expect(result).toContainEqual({
    path: "tokens/dark.json",
    name: "dark",
    data: JSON.stringify(tokens.dark, null, 2),
  });
  expect(result).toContainEqual({
    path: "tokens/$themes.json",
    name: "$themes",
    data: JSON.stringify(themes, null, 2),
  });
  expect(result).toContainEqual({
    path: "tokens/$metadata.json",
    name: "$metadata",
    data: JSON.stringify(metadata, null, 2),
  });
});

test("prepareTokensForPush handles empty tokens", () => {
  const tokens: Record<string, DesignTokens> = {};
  const themes: ThemeObject[] = [];
  const metadata: RemoteTokenStorageMetadata = {};

  const result = prepareTokensForPush({ tokens, themes, metadata });

  expect(result).toHaveLength(2); // Only themes and metadata
  expect(result).toContainEqual({
    path: "tokens/$themes.json",
    name: "$themes",
    data: "[]",
  });
  expect(result).toContainEqual({
    path: "tokens/$metadata.json",
    name: "$metadata",
    data: "{}",
  });
});

test("prepareTokensForPush correctly formats JSON", () => {
  const tokens: Record<string, DesignTokens> = {
    test: { color: { primary: { value: "#FF0000" } } },
  };
  const themes: ThemeObject[] = [
    {
      id: "light",
      name: "light",
      selectedTokenSets: { test: TokenSetStatus.SOURCE },
    },
  ];
  const metadata: RemoteTokenStorageMetadata = { tokenSetOrder: ["test"] };

  const result = prepareTokensForPush({ tokens, themes, metadata });

  expect(result).toHaveLength(3);
  expect(JSON.parse(result[0]!.data)).toEqual(tokens.test);
  expect(JSON.parse(result[1]!.data)).toEqual(themes);
  expect(JSON.parse(result[2]!.data)).toEqual(metadata);
});
