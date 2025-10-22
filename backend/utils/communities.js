// @ts-check
import database from "../database.js";

/** @import {infer as zinfer} from "zod" */
/** @import {CommUserPair} from "../schemas/communities.js" */

const community_members = database.from("community_members")

export async function getAllCommunities() {
  return database.from("communities").select();
}

/**
 * @param {zinfer<CommUserPair>} param0 
 */
export async function addUserToCommunity({ user_id, community_id }) {
  return community_members.insert({ community_id, user_id, joined_at: new Date() });
}

/**
 * @param {zinfer<CommUserPair>} param0 
 */
export async function removeUserFromCommunity({ user_id, community_id }) {
  return community_members.delete().eq('community_id', community_id).eq('user_id', user_id);
}
