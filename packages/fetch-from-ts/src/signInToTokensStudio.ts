import { UserAuth } from "@tokens-studio/sdk";

export async function signInToTokensStudio(username: string, password: string) {
  await UserAuth.signIn(username, password);
}
