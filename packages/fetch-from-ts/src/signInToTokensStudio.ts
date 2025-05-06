import { create } from "@tokens-studio/sdk";

export async function signInToTokensStudio(username: string, password: string) {
  const client = create({
    auth: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
  });
  
  return client;
}
