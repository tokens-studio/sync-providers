import { create } from "@tokens-studio/sdk";

export async function signInToTokensStudio(auth: string) {
  const client = create({ auth });

  return client;
}
