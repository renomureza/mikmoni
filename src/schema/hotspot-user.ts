import * as z from "zod/v4";
import {
  dataLimitUnitValues,
  userModeValues,
  usernameCharacterValues,
} from "~/contants/hotspot-user";

export const hotspotUserGeneratorSchema = z.object({
  server: z.string().min(1),
  profile: z.string().min(1),
  userMode: z.enum(userModeValues),
  nameLength: z.coerce.number().int().min(3),
  prefix: z.string(),
  character: z.enum(usernameCharacterValues),
  timeLimit: z.union([
    z.literal(""),
    z
      .string()
      .regex(
        /^(?=.)(\d+w)?(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/,
        "Invalid duration format. Use a combination of w/d/h/m/s in order, e.g. 3w6d15h29m11s, 1d, or 30m.",
      ),
  ]),
  dataLimit: z.union([z.literal(""), z.coerce.number().int().min(1)]),
  dataLimitUnit: z.enum(dataLimitUnitValues),
  comment: z.string(),
});
