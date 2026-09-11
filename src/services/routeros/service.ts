import { db, schema } from "~/lib/db";
import * as z from "zod/v4-mini";
import { eq } from "drizzle-orm";

export async function getAllRouteros() {
  const routeros = await db.query.routeros.findMany();
  return routeros;
}

const getRouterosInputSchema = z.object({
  id: z.coerce.number().check(z.int(), z.minimum(1)),
});
export type GetRouterosInputSchema = z.input<typeof getRouterosInputSchema>;
export async function getRouteros(id: GetRouterosInputSchema) {
  const validation = getRouterosInputSchema.safeParse(id);
  if (!validation.success) return null;
  const routeros = await db.query.routeros.findFirst({
    where: { id: validation.data.id },
  });
  return routeros || null;
}

const createRouterosInputSchema = z.object({
  name: z.string().check(z.minLength(1), z.trim()),
  host: z.string().check(z.minLength(1), z.trim()),
  port: z.coerce.number().check(z.int(), z.minimum(0), z.maximum(65_535)),
  user: z.string().check(z.minLength(1)),
  password: z.string().check(z.minLength(1)),
  tls: z.boolean(),
});
export type CreateRouterosInput = z.input<typeof createRouterosInputSchema>;
export async function createRouteros(data: CreateRouterosInput) {
  const validation = createRouterosInputSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      error: z.flattenError(validation.error).fieldErrors,
    };
  }

  const routeros = await db.insert(schema.routeros).values({
    name: validation.data.name,
    host: validation.data.host,
    port: validation.data.port,
    user: validation.data.user,
    password: validation.data.password,
    tls: validation.data.tls,
  });

  return { success: true, data: routeros };
}

const updateRouterosInputSchema = z.extend(createRouterosInputSchema, {
  id: z.coerce.number().check(z.int(), z.minimum(1)),
});
export type UpdateRouterosInputSchema = z.input<
  typeof updateRouterosInputSchema
>;
export async function updateRouteros(data: UpdateRouterosInputSchema) {
  const validation = updateRouterosInputSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      errors: z.flattenError(validation.error).fieldErrors,
    };
  }

  const routeros = await db.query.routeros.findFirst({
    where: {
      id: validation.data.id,
    },
    columns: {
      id: true,
    },
  });

  if (!routeros) {
    return { success: false, error: "RouterOS not found" };
  }

  const updatedRouteros = await db
    .update(schema.routeros)
    .set({
      name: validation.data.name,
      host: validation.data.host,
      port: validation.data.port,
      user: validation.data.user,
      password: validation.data.password,
      tls: validation.data.tls,
    })
    .where(eq(schema.routeros.id, routeros.id));

  return { success: true, data: updatedRouteros };
}

const deleteRouterosInputSchema = z.object({
  id: z.coerce.number(),
});
export type DeleteRouterosInputSchema = z.input<
  typeof deleteRouterosInputSchema
>;
export async function deleteRouteros(data: DeleteRouterosInputSchema) {
  const validation = deleteRouterosInputSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      error: "Routeros not found",
    };
  }

  const routeros = await db.query.routeros.findFirst({
    where: {
      id: validation.data.id,
    },
    columns: {
      id: true,
    },
  });

  if (!routeros) {
    return { success: false, error: "RouterOS not found" };
  }

  await db.delete(schema.routeros).where(eq(schema.routeros.id, routeros.id));

  return { success: true };
}
