import { create } from "@tokens-studio/sdk";

export async function signInToTokensStudio(username: string, password: string) {
  const client = create({
    auth: {
      username,
      password
    }
  });
  
  return client;
}
