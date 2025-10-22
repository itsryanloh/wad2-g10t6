// @ts-check
import z from "zod";
import database from "../database.js";

export const CommUserPair = z.object({
  community_id: z.uuid().refine(id => checkExistsInTable("communities", id), { error({ input }) { return `community_id ${input} not found` } }),
  user_id: z.uuid().refine(id => checkExistsInTable("users", id), { error({ input }) { return `user_id ${input} not found` } })
});

export const CommId = z.uuid()

/**
 * @param {"users" | "communities"} table 
 * @param {string} id
 * @returns {Promise<boolean>}
 */
async function checkExistsInTable(table, id) {
  return database.from(table).select("*", { count: "estimated", head: true }).eq("id", id).then(({ error, count }) => Boolean(!error && count))
}
