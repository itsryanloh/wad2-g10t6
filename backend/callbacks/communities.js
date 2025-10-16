// @ts-check
import database from "../database.js";
import { CommJoinRequest } from "../schemas/communities.js";

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function joinCommunity(req, res) {
  const { data, success, error } = CommJoinRequest.safeParse(req.body)

  if (!success)
    return res.status(400).send(error.issues);

  const { community_id, user_id } = data
  if (!(await checkExistsInTable("users", user_id)).success) {
    return res.status(400).send(`User with id ${user_id} not found`);
  }

  if (!(await checkExistsInTable("communities", community_id)).success) {
    return res.status(400).send(`Community with id ${community_id} not found`);
  }

  return res.send((await database.from("community_members").insert({ community_id, user_id, joined_at: new Date() })).statusText)
}

/**
 * @param {"users" | "communities"} table 
 * @param {string} id
 * @returns {Promise<{success:boolean, message: string}>}
 */
async function checkExistsInTable(table, id) {
  const { error, count } = await database.from(table).select("*", { count: "estimated", head: true }).eq("id", id)
  if (error)
    return { success: false, message: error.message }

  if (!count)
    return { success: false, message: "No records found" }

  return { success: true, message: "Success" }
}
