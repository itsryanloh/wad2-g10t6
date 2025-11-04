// @ts-check

import express from "express"
import { findSimilarLocations, getCommunityByLngLat, pinArea } from "../callbacks/maps.js"

const router = express.Router()

router.get("/", pinArea)
router.get("/search", findSimilarLocations)
router.get("/community", getCommunityByLngLat)

export default router
