// @ts-check

import express from "express"
import { pinArea } from "../callbacks/maps.js"

const router = express.Router()

router.get("/", pinArea)

export default router
