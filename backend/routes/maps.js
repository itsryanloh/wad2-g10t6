// @ts-check

import express from "express"
import { findSimilarLocations, pinArea } from "../callbacks/maps.js"

const router = express.Router()

router.get("/", pinArea)
router.get("/search", findSimilarLocations)

export default router
