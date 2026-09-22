import { db, schema } from ".";
import { hashPassword } from "~/utils/encryption";

await (async () => {
  await db.insert(schema.users).values({
    name: "Admin",
    username: "admin",
    password: await hashPassword("123"),
  });
})();
