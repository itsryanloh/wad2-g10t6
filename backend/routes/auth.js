import bcrypt from "bcrypt";
import express from "express";
import supabase from "../database.js";
import twilio from "twilio";
import z from "zod";
import { User } from "../schemas/user.js";

const router = express.Router();
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
})

router.post("/register", async (req, res) => {
  const user = req.body;
  const { error: parseError } = User.safeParse(user);
  if (parseError) return res.status(400).send(JSON.parse(parseError.message));

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(user.password, saltRounds);
  const newUser = { ...user, password: hashedPassword };

  const { error, data } = await supabase.from("users").insert(newUser).select();
  if (error) return res.status(400).send(error.message);
  return res.status(201).send({ message: `User with id ${data[0].id} created successfully` });
})

router.post("/login", async (req, res) => {
  const { error: parseError } = loginSchema.safeParse(req.body);
  if (parseError) return res.status(400).send(JSON.parse(parseError.message));

  const { username, password } = req.body;
  const { error, data } = await supabase.from("users").select("*").eq("username", username);
  if (error) {
    return res.status(400).send({ error: error.message });
  } else if (!data.length) {
    return res.status(404).send({ error: `User with username ${username} not found` });
  }

  const user = data[0]
  const success = await bcrypt.compare(password, user.password);
  if (success) {
    await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({ to: user.contact_no.split(" ").join(""), channel: "sms" });
  } else {
    return res.status(400).send({ error: "Wrong password" });
  }
  res.json({ message: "Code sent" })
})

router.post("/send-code", async (req, res) => {
  const { phone } = req.body;
  await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
    .verifications.create({ to: phone, channel: "sms" });
  res.json({ message: "Code sent" });
})

router.post("/verify-code", async (req, res) => {
  const { phone, code } = req.body;
  const check = await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
    .verificationChecks.create({ to: phone, code });
  
  if (check.status === "approved") {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// TODO: convert to hashes
router.put("/password/:id", async (req, res) => {
  const id = req.params.id;
  const { error, data } = await supabase.from("users").select("*").eq("id", id);
  if (error) {
    return res.status(400).send(error.message);
  } else if (!data.length) {
    return res.status(404).send(`User with id ${id} not found`);
  }

  const user = data[0]
  const { current_password, new_password } = req.body;

  if (current_password != user.password) {
    return res.status(400).send({ error: "Wrong password" })
  }

  const newUser = { ...user, password: new_password }
  const { error: updateError } = await supabase.from("users").update(newUser).eq("id", id).select();
  if (updateError) return res.status(400).send(JSON.parse(updateError.message));

  return res.status(201).send("Password change successful")
})

export default router;
