import { PrismaClient } from "../src/generated/prisma/client";
const p = new PrismaClient();
p.user
  .findMany()
  .then((u) => {
    console.log(JSON.stringify(u.map((x) => ({ name: x.name, email: x.email, role: x.role })), null, 2));
  })
  .catch((e) => console.error(e))
  .finally(() => p.$disconnect());
