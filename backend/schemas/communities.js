// @ts-check
import z from "zod";

export const CommJoinRequest = z.object({
  community_id: z.uuid(),
  user_id: z.uuid()
});

