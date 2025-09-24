import express from "express";
import supabase from "../database.js";
import * as z from "zod";

const router = express.Router();

const User = z.object({
  name: z.string(),
  age: z.number(),
  gender: z.string(),
  password: z.string(),
  contact_no: z.number(),
  role: z.literal(["user", "shelter"]),
})

router.get("/", async (req, res, next) => {
  const { error, data } = await supabase.from("users").select("*");
  if (error) throw new Error(error);
  res.send(data);
});

router.post("/", async (req, res) => {
  const user = req.body;
  const result = User.safeParse(user);
  if (!result.success) {
    res.status(400).send(JSON.parse(result.error.message));
    return;
  } else {
    console.log(user);
    supabase.from("users").insert(user);
    return;
  }
})

export default router;
