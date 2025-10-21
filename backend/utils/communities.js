// @ts-check
import database from "../database.js";

const community_members = database.from("community_members")

/**
 * @param {string} user_id 
 * @param {string} community_id
 */
export async function addUserToCommunity(user_id, community_id) {
  return community_members.insert({ community_id, user_id, joined_at: new Date() }).then(({ statusText }) => statusText)
}

/**
 * @param {string} user_id 
 * @param {string} community_id
 */
export async function removeUserFromCommunity(user_id, community_id) {
  return database.from("community_members").delete().eq('community_id', community_id).eq('user_id', user_id).then(({ statusText }) => statusText)
}
