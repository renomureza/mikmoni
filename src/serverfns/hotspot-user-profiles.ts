import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { randomInt } from "crypto";
import { toast } from "sonner";
import * as z from "zod/v4";
import {
  ExpiredModeValue,
  expiredModeValues,
} from "~/contants/hotspot-profile";
import { authAndRouterosMiddleware } from "~/middlewares/auth";
import {
  extractOnLoginScriptPutFields,
  getRouterOSDatePositions,
  getRouterosMonthList,
  isISORouterOSDate,
  rateLimitSchema,
} from "~/utils/routeros";
import { tryCatch } from "~/utils/utilities";

type HotspotUserProfile = {
  ".id": string;
  name: string;
  "shared-users": string;
  "rate-limit"?: string;
  "parent-queue"?: string;
  "on-login"?: string;
  "address-pool"?: string;
};

const $getHotspotUserProfiles = createServerFn()
  .middleware([authAndRouterosMiddleware])
  .handler(async ({ context }) => {
    const profiles = (await context.routerosClient.write(
      "/ip/hotspot/user/profile/print",
      {
        ".proplist":
          ".id,name,rate-limit,shared-users,parent-queue,address-pool,on-login",
      },
    )) as HotspotUserProfile[];

    return profiles.map(({ "on-login": onLoginScript, ...profile }) => {
      const { expireMode, lockUser, price, sellingPrice, validity } =
        extractOnLoginScriptPutFields(onLoginScript ?? "");

      return {
        ...profile,
        expiredMode: expireMode as ExpiredModeValue,
        validity,
        price: !price || price === "0" ? "" : price,
        sellingPrice: !sellingPrice || sellingPrice === "0" ? "" : sellingPrice,
        lockUsers: lockUser === "Enable",
      };
    });
  });

function getHotspotUserProfilesQueryOptions({
  queryFn,
}: {
  queryFn: (
    ...args: Parameters<typeof $getHotspotUserProfiles>
  ) => ReturnType<typeof $getHotspotUserProfiles>;
}) {
  return queryOptions({
    queryKey: ["routeros", "hotspot", "users", "profiles"],
    queryFn: () => queryFn(),
    placeholderData: keepPreviousData,
  });
}

export function useGetHotspotUserProfilesQuery() {
  const query = useServerFn($getHotspotUserProfiles);
  return useQuery(getHotspotUserProfilesQueryOptions({ queryFn: query }));
}

export function ensureGetHotspotUserProfilesQueryData({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  return queryClient.query(
    getHotspotUserProfilesQueryOptions({ queryFn: $getHotspotUserProfiles }),
  );
}

export function useGetHotspotUserProfilesSuspenseQuery() {
  const getter = useServerFn($getHotspotUserProfiles);
  return useSuspenseQuery(
    getHotspotUserProfilesQueryOptions({ queryFn: getter }),
  );
}

//

function createBackgroundScript({
  expiredMode,
  profileName,
  sampleDateFormat,
}: {
  expiredMode: NonNullable<ExpiredModeValue>;
  profileName: string;
  sampleDateFormat: string;
}) {
  const modeScript =
    expiredMode === "rem" || expiredMode === "remc"
      ? "remove"
      : "set limit-uptime=1s";

  const months = getRouterosMonthList(sampleDateFormat);
  const datePositions = getRouterOSDatePositions(sampleDateFormat);

  return `:local dateint do={
  :local montharray ( ${months.join(",")} );
  :local days [ :pick $d ${datePositions.day.start} ${datePositions.day.end} ];
  :local month [ :pick $d ${datePositions.month.start} ${datePositions.month.end} ];
  :local year [ :pick $d ${datePositions.year.start} ${datePositions.year.end} ];
  :local monthint ([ :find $montharray $month]);
  :local month ($monthint + 1);
  :if ( [len $month] = 1) do={
    :local zero ("0");
    :return [:tonum ("$year$zero$month$days")];
  } else={
    :return [:tonum ("$year$month$days")];
  }
};
:local timeint do={ 
  :local hours [ :pick $t 0 2 ]; 
  :local minutes [ :pick $t 3 5 ]; 
  :return ($hours * 60 + $minutes) ; 
}; 
:local date [ /system clock get date ]; 
:local time [ /system clock get time ]; 
:local today [$dateint d=$date]; 
:local curtime [$timeint t=$time]; 
:foreach i in [ /ip hotspot user find where profile="${profileName}" ] do={ 
  :local comment [ /ip hotspot user get $i comment]; 
  :local name [ /ip hotspot user get $i name]; 
  :local gettime [:pic $comment ${datePositions.time.start} ${datePositions.time.end}]; 
  :if ([:pic $comment ${datePositions.firstSeparatorPosition}] = "${datePositions.separator}" and [:pic $comment ${datePositions.secondSeparatorPosition}] = "${datePositions.separator}") do={
    :local expd [$dateint d=$comment]; 
    :local expt [$timeint t=$gettime]; 
    :if (($expd < $today and $expt < $curtime) or ($expd < $today and $expt > $curtime) or ($expd = $today and $expt < $curtime)) do={ 
      [ /ip hotspot user ${modeScript} $i ]; 
      [ /ip hotspot active remove [find where user=$name] ];
    }
  }
}`;
}

function createOnLoginScript({
  expiredMode,
  price,
  sellingPrice,
  lockUsers,
  validity,
  profileName,
  sampleDateFormat,
}: {
  profileName: string;
  expiredMode?: ExpiredModeValue | null;
  price: number;
  sellingPrice: number;
  lockUsers: boolean;
  validity: string;
  sampleDateFormat: string;
}) {
  const lockScript = lockUsers
    ? `[:local mac $"mac-address"; /ip hotspot user set mac-address=$mac [find where name=$user]];`
    : "";

  if (!expiredMode) {
    return `:put (",,${price},,,noexp,${lockUsers ? "Enable" : "Disable"},"); ${lockScript}`;
  }

  const datePosition = getRouterOSDatePositions(sampleDateFormat);

  return `:put (",${expiredMode},${price},${validity},${sellingPrice},,${lockUsers ? "Enable" : "Disable"},"); 
{
  :local comment [ /ip hotspot user get [/ip hotspot user find where name="$user"] comment]; 
  :local ucode [:pic $comment 0 2]; 
  :if ($ucode = "vc" or $ucode = "up" or $comment = "") do={ 
    :local date [ /system clock get date ];
    :local year [ :pick $date ${datePosition.year.start} ${datePosition.year.end} ];
    :local month [ :pick $date ${datePosition.month.start} ${datePosition.month.end} ]; 
    /sys sch add name="$user" disable=no start-date=$date interval="${validity}"; 
    :delay 5s; 
    :local exp [ /sys sch get [ /sys sch find where name="$user" ] next-run]; 
    :local getxp [len $exp]; 
    :if ($getxp = 15) do={ 
      :local d [:pic $exp 0 6]; 
      :local t [:pic $exp 7 16]; 
      :local s ("/"); 
      :local exp ("$d$s$year $t"); 
      /ip hotspot user set comment="$exp" [find where name="$user"];
    }; 
    :if ($getxp = 8) do={ 
      /ip hotspot user set comment="$date $exp" [find where name="$user"];
    }; 
    :if ($getxp > 15) do={ 
      /ip hotspot user set comment="$exp" [find where name="$user"];
    };
    :delay 5s; 
    /sys sch remove [find where name="$user"];
    ${
      expiredMode === "ntfc" || expiredMode === "remc"
        ? `:local mac $"mac-address"; 
  :local time [/system clock get time ]; 
  /system script add name="$date-|-$time-|-$user-|-${price}-|-$address-|-$mac-|-${validity}-|-${profileName}-|-$comment" owner="$month$year" source="$date" comment="mikhmon";`
        : ""
    }
    ${lockScript}
  }
}`;
}

const createHotspotUserProfileInputSchema = z.object({
  name: z
    .string()
    .min(1)
    .trim()
    .refine((val) => !/\s+/.test(val), "Cannot contain spaces."),
  "address-pool": z.string().nullish(),
  "shared-users": z.union([z.literal(""), z.coerce.number()]),
  "rate-limit": z.union([z.literal(""), rateLimitSchema]).nullish(),
  expiredMode: z.enum(expiredModeValues).nullish(),
  validity: z.union([
    z.literal(""),
    z
      .string()
      .regex(
        /^(?=.)(\d+d)?(\d+h)?(\d+m)?$/,
        "Use a combination of d/h/m in order, e.g. 1d5h30m, 1d, or 30m.",
      ),
  ]),
  price: z.coerce.number().int().min(0),
  sellingPrice: z.coerce.number().int().min(0),
  lockUsers: z.boolean(),
  "parent-queue": z.string().nullish(),
});

type CreateHotspotUserProfileInputSchema = z.input<
  typeof createHotspotUserProfileInputSchema
>;

const $createHotspotUserProfile = createServerFn({ method: "POST" })
  .middleware([authAndRouterosMiddleware])
  .validator((d: CreateHotspotUserProfileInputSchema) => d)
  .handler(async ({ context, data }) => {
    const validation = createHotspotUserProfileInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }

    const routerosClient = context.routerosClient;

    const {
      expiredMode,
      price,
      sellingPrice,
      validity,
      lockUsers,
      name: profileName,
    } = validation.data;

    const sampleDateFormat = await routerosClient
      .write("/system/clock/print", { ".proplist": "date" })
      .then((d) => d[0].date);

    const onLoginScript = createOnLoginScript({
      expiredMode,
      price,
      sellingPrice,
      lockUsers,
      profileName,
      validity,
      sampleDateFormat,
    });

    const res = await tryCatch(
      routerosClient.write("/ip/hotspot/user/profile/add", {
        name: validation.data.name,
        "rate-limit": validation.data["rate-limit"] ?? "",
        "shared-users": validation.data["shared-users"],
        "address-pool": validation.data["address-pool"] ?? "none",
        "parent-queue": validation.data["parent-queue"] ?? "none",
        "on-login": onLoginScript,
      }),
    );

    if (!res.ok) {
      return { success: false, error: res.error };
    }

    if (expiredMode) {
      await routerosClient.write("/system/scheduler/add", {
        name: profileName,
        "start-time": `0${randomInt(1, 6)}:${randomInt(10, 60)}:${randomInt(10, 60)}`,
        interval: `00:02:${randomInt(10, 60)}`,
        "on-event": createBackgroundScript({
          expiredMode,
          profileName,
          sampleDateFormat,
        }),
        disabled: "no",
        comment: `Monitor Profile ${profileName}`,
      });
    }

    return { success: true };
  });

export function useCreateHotspotUserProfile() {
  const mutate = useServerFn($createHotspotUserProfile);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["routeros"] });
        toast.success("Profile successfully created.");
      } else if (data?.error) {
        toast.error(data.error);
      }
    },
  });
}

//

const updateHotspotUserProfileInputSchema =
  createHotspotUserProfileInputSchema.extend({
    ".id": z.string(),
  });

type UpdateHotspotUserProfileInputSchema = z.input<
  typeof updateHotspotUserProfileInputSchema
>;

const $updateHotspotUserProfile = createServerFn({ method: "POST" })
  .middleware([authAndRouterosMiddleware])
  .validator((d: UpdateHotspotUserProfileInputSchema) => d)
  .handler(async ({ context, data }) => {
    const validation = updateHotspotUserProfileInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }
    const routerosClient = context.routerosClient;

    const {
      expiredMode,
      price,
      sellingPrice,
      validity,
      lockUsers,
      name: profileName,
    } = validation.data;

    const sampleDateFormat = await routerosClient
      .write("/system/clock/print", { ".proplist": "date" })
      .then((d) => d[0].date);

    const onLoginScript = createOnLoginScript({
      expiredMode,
      price,
      sellingPrice,
      lockUsers,
      profileName,
      validity,
      sampleDateFormat,
    });

    const profile = await routerosClient
      .write(
        "/ip/hotspot/user/profile/print",
        {
          ".proplist": "name,.id",
        },
        [`?.id=${validation.data[".id"]}`],
      )
      .then((d) => d[0] as { ".id": string; name: string } | undefined);

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    const res = await tryCatch(
      routerosClient.write("/ip/hotspot/user/profile/set", {
        ".id": validation.data[".id"],

        name: profileName,
        "rate-limit": validation.data["rate-limit"] ?? "",
        "shared-users": validation.data["shared-users"],
        "address-pool": validation.data["address-pool"] ?? "none",
        "parent-queue": validation.data["parent-queue"] ?? "none",
        "on-login": onLoginScript,
      }),
    );

    if (!res.ok) {
      return { success: false, error: res.error };
    }

    const scheduler = await routerosClient
      .write("/system/scheduler/print", { ".proplist": ".id,name" }, [
        `?name=${profile.name}`,
      ])
      .then((d) => d[0] as { ".id": string; name: string } | undefined);

    const createSchedulerPaylad = ({
      expiredMode,
      profileName,
    }: {
      expiredMode: Exclude<ExpiredModeValue, null>;
      profileName: string;
    }) => {
      return {
        name: profileName,
        "start-time": `0${randomInt(1, 6)}:${randomInt(10, 60)}:${randomInt(10, 60)}`,
        interval: `00:02:${randomInt(10, 60)}`,
        "on-event": createBackgroundScript({
          expiredMode,
          profileName,
          sampleDateFormat,
        }),
        disabled: "no",
        comment: `Monitor Profile ${profileName}`,
      };
    };

    if (scheduler && expiredMode) {
      await routerosClient.write("/system/scheduler/set", {
        ".id": scheduler[".id"],
        ...createSchedulerPaylad({ expiredMode, profileName }),
      });
    } else if (scheduler && !expiredMode) {
      await routerosClient.write("/system/scheduler/remove", {
        ".id": scheduler[".id"],
      });
    } else if (!scheduler && expiredMode) {
      await routerosClient.write(
        "/system/scheduler/add",
        createSchedulerPaylad({ expiredMode, profileName }),
      );
    }

    return { success: true };
  });

export function useUpdateHotspotUserProfile() {
  const mutate = useServerFn($updateHotspotUserProfile);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["routeros"] });
        toast.success("Profile successfully updated.");
      } else if (data?.error) {
        toast.error(data.error);
      }
    },
  });
}

//

const deleteHotspotUserProfileInputSchema = z.object({
  ".id": z.string(),
});

type DeleteHotspotUserProfileInputSchema = z.input<
  typeof deleteHotspotUserProfileInputSchema
>;

const $deleteHotspotUserProfile = createServerFn({ method: "POST" })
  .middleware([authAndRouterosMiddleware])
  .validator((d: DeleteHotspotUserProfileInputSchema) => d)
  .handler(async ({ context, data }) => {
    const validation = deleteHotspotUserProfileInputSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: z.flattenError(validation.error).fieldErrors,
      };
    }
    const routerosClient = context.routerosClient;

    const profile = await routerosClient
      .write(
        "/ip/hotspot/user/profile/print",
        {
          ".proplist": "name,.id",
        },
        [`?.id=${validation.data[".id"]}`],
      )
      .then((d) => d[0] as { ".id": string; name: string } | undefined);

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    const res = await tryCatch(
      routerosClient.write("/ip/hotspot/user/profile/remove", {
        ".id": validation.data[".id"],
      }),
    );

    if (!res.ok) {
      return { success: false, error: res.error };
    }

    const scheduler = await routerosClient
      .write("/system/scheduler/print", { ".proplist": ".id,name" }, [
        `?name=${profile.name}`,
      ])
      .then((d) => d[0] as { ".id": string; name: string } | undefined);

    if (scheduler) {
      await routerosClient.write("/system/scheduler/remove", {
        ".id": scheduler[".id"],
      });
    }

    return { success: true };
  });

export function useDeleteHotspotUserProfile() {
  const mutate = useServerFn($deleteHotspotUserProfile);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutate,
    onSuccess: async (data) => {
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["routeros"] });
        toast.success("Profile successfully deleted.");
      } else if (data?.error) {
        toast.error(data.error);
      }
    },
  });
}
