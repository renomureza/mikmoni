import { randomInt } from "node:crypto";
import { UserModeValue, UsernameCharacterValue } from "~/contants/hotspot-user";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUM = "0123456789";
const REQUIRED_CATEGORIES: Record<UsernameCharacterValue, string[]> = {
  alpha_lower: [LOWER],
  alpha_upper: [UPPER],
  alpha_lower_upper: [LOWER, UPPER],
  alpha_num_lower: [LOWER, NUM],
  alpha_num_upper: [UPPER, NUM],
  alpha_num_lower_upper: [LOWER, UPPER, NUM],
};

function randomChar(charset: string): string {
  const index = randomInt(0, charset.length);
  return charset[index];
}

function shuffleFisherYates<TValue>(chars: TValue[]): TValue[] {
  const arr = [...chars];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomStringWithGuarantee(
  length: number,
  categories: string[],
): string {
  const fullCharset = categories.join("");
  const result: string[] = [];

  for (const category of categories) {
    result.push(randomChar(category));
  }

  for (let i = result.length; i < length; i++) {
    result.push(randomChar(fullCharset));
  }

  return shuffleFisherYates(result).join("");
}

export function generateHotspotUserCredential({
  prefix,
  length,
  mode,
  character,
}: {
  prefix: string;
  length: number;
  mode: UserModeValue;
  character: UsernameCharacterValue;
}): { username: string; password: string } {
  const categories = REQUIRED_CATEGORIES[character];

  const randomPart = randomStringWithGuarantee(length, categories);
  const username = `${prefix}${randomPart}`;

  const password =
    mode === "up"
      ? username
      : `${prefix}${randomStringWithGuarantee(length, categories)}`;

  return { username, password };
}
