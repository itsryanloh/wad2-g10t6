import * as z from "zod";

const User = z.object({
  name: z.string(),
  username: z.string().min(3),
  age: z.number(),
  gender: z.string(),
  password: z.string().min(8),
  contact_no: z.string(),
  avatar_url: z.string(),
  role: z.literal(["user", "shelter"]),
});

export { User };
