import { db, schema } from ".";
import { hashPassword } from "~/utils/encryption";

(async () => {
  await db.insert(schema.users).values({
    name: "Admin",
    username: "admin",
    password: await hashPassword("123"),
  });
})();
