import bcrypt from "bcrypt";
import express from "express";
import supabase from "../database.js";
import twilio from "twilio";
import z from "zod";
import jwt from "jsonwebtoken";
import { User } from "../schemas/user.js";

const router = express.Router();
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)

if (!process.env.TOKEN_SECRET) {
  throw new Error("TOKEN_SECRET env var not set.")
}

const codeSchema = z.object({
  username: z.string().min(3),
  code: z.string().length(6),
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
    if (user.has_2fa_enabled) {
      await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
        .verifications.create({ to: user.contact_no.split(" ").join(""), channel: "sms" });
      return res.json({ message: "User has 2fa enabled. Code has been sent to user's phone number." });
    }

    const token = jwt.sign({ user_id: user.id, username: user.username, name: user.name, avatar_url: user.avatar_url }, process.env.TOKEN_SECRET, { expiresIn: "1h" });
    return res.json({ message: "Login successful.", token });
  } else {
    return res.status(400).send({ error: "Wrong password" });
  }
})

// router.post("/send-code", async (req, res) => {
//   const { phone } = req.body;
//   await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
//     .verifications.create({ to: phone, channel: "sms" });
//   res.json({ message: "Code sent" });
// })

router.post("/verify-code", async (req, res) => {
  const { error: parseError } = codeSchema.safeParse(req.body);
  if (parseError) return res.status(400).send(JSON.parse(parseError.message));

  const { username, code } = req.body;
  const { error, data } = await supabase.from("users").select("*").eq("username", username);
  if (error) {
    return res.status(400).send({ error: error.message });
  } else if (!data.length) {
    return res.status(404).send({ error: `User with username ${username} not found` });
  }
  const user = data[0]
  try {
    const check = await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: user.contact_no, code });
    
    if (check.status === "approved") {
      const token = jwt.sign({ user_id: user.id, username: user.username, name: user.name, avatar_url: user.avatar_url }, process.env.TOKEN_SECRET, { expiresIn: "1h" });
      res.json({ message: "Login successful.", token });
    } else {
      res.status(401).json({ error: "Login failed. Incorrect code." });
    }
  } catch (error) {
    res.status(400).json({ error: "Login failed.", message: error });
  }
});

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

  const success = await bcrypt.compare(current_password, user.password);
  if (!success) {
    return res.status(400).send({ error: "Wrong password" })
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(new_password, saltRounds);
  const newUser = { ...user, password: hashedPassword }
  const { error: updateError } = await supabase.from("users").update(newUser).eq("id", id).select();
  if (updateError) return res.status(400).send(JSON.parse(updateError.message));

  return res.status(201).send("Password change successful")
})

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ error: 'Unauthorized: No Bearer token provided or invalid format.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    res.send(payload);
  } catch (error) {
    res.status(401).send({ error: error })
  }

})

export default router;
