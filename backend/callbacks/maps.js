// @ts-check

import { LngLat } from "../schemas/maps.js";
import { findAreaName } from "../utils/maps.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function pinArea(req, res) {
  const { data, success, error } = LngLat.safeParse(req.query);

  if (!success)
    return res.status(400).send(error.issues)

  const { lng, lat } = data;

  const area = await findAreaName([lng, lat])

  if (!area) {
    return res.status(404).send({ error: "Area not found" })
  }

  return res.send({ data: { area } })
}
