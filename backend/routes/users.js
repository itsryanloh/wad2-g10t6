import express from "express";
import supabase from "../database.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const users = await supabase.from("users").select("*");
  console.log(users);
  res.send("respond with resource");
});

export default router;
