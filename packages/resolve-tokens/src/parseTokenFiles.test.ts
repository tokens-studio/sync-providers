import { describe, test, expect } from "vitest";
import { parseTokenFiles } from "./parseTokenFiles.js";

const files = [
  {
    path: "src/tokens/file1.json",
    name: "file1",
    data: '{ "foo": "bar" }\n',
  },
  {
    path: "src/tokens/file2.json",
    name: "file2",
    data: '{ "foo": "baz" }\n',
  },
  {
    path: "src/tokens/$themes.json",
    name: "$themes",
    data: '{ "foo": "themes" }\n',
  },
  {
    path: "src/tokens/$metadata.json",
    name: "$metadata",
    data: '{ "foo": "metadata" }\n',
  },
];

describe("parseTokenFiles", () => {
  test("parses token files", async () => {
    const parsedFiles = await parseTokenFiles(files);
    expect(parsedFiles).toEqual({
      tokenFiles: {
        file1: { foo: "bar" },
        file2: { foo: "baz" },
      },
      $themes: { foo: "themes" },
      $metadata: { foo: "metadata" },
    });
  });
});
