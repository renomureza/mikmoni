import { db, schema } from ".";
import { hashPassword } from "~/utils/encryption";

(async () => {
  await db.insert(schema.users).values({
    name: "Admin",
    email: "admin@example.com",
    password: await hashPassword("123"),
  });
})();
