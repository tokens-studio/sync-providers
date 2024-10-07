import { Configuration, UserAuth } from "@tokens-studio/sdk";

export async function signInToTokensStudio(username: string, password: string) {
  Configuration.configure();

  await UserAuth.signIn(username, password);
}
