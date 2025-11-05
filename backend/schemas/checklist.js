import * as z from "zod";

const Checklist = z.object({
  user_id: z.string().uuid(),
  post_id: z.string().uuid(),
  item_index: z.number().int().min(0).max(5)
})

export { Checklist }
