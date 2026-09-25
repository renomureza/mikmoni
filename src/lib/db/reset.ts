import * as schema from "./schema";
import { db } from ".";

await Promise.all(Object.values(schema).map((table) => db.delete(table)));
console.log("reseted");
