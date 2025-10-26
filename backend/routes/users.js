import express from "express";
import supabase from "../database.js";
import twilio from "twilio";
import { User } from "../schemas/user.js"

const router = express.Router();
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)

router.get("/", async (_, res) => {
  const { error, data } = await supabase.from("users").select("*");
  if (error) {
    return res.status(400).send(error.message);
  }
  res.send(data);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const { error, data } = await supabase.from("users").select("*").eq("id", id);
  if (error) {
    return res.status(400).send(error.message);
  } else if (!data.length) {
    return res.status(404).send(`User with id ${id} not found`);
  }
  res.send(data);
});

router.get("/username/:username", async (req, res) => {
  const username = req.params.username
  
  const { error, data } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single()
  
  if (error) {
    return res.status(400).send(error.message)
  } else if (!data) {
    return res.status(404).send(`User with username ${username} not found`)
  }
  
  res.send(data)
})

router.post("/", async (req, res) => {
  const user = req.body;
  const { error: parseError } = User.safeParse(user);
  if (parseError) return res.status(400).send(JSON.parse(parseError.message));

  const { error, data } = await supabase.from("users").insert(user).select();
  if (error) return res.status(400).send(error.message);
  return res.status(201).send(data[0]);
});

router.patch("/:id", async (req, res) => {
  if (req.body.password) return res.status(400).send("Wrong endpoint for changing password, use /api/auth/password");

  const id = req.params.id;
  //check if user exists
  const { error: fetchError, data: currentData } = await supabase.from("users").select("*").eq("id", id);
  if (fetchError) return res.status(404).send(`User with id ${id} not found`);

  //check if new fields are valid
  const newUser = { ...currentData[0], ...req.body };
  const { error: parseError } = User.safeParse(newUser);
  if (parseError) return res.status(400).send(JSON.parse(parseError.message));

  //execute update on db
  const { error: updateError, data: newData } = await supabase.from("users").update(newUser).eq("id", id).select();
  if (updateError) return res.status(400).send(JSON.parse(updateError.message));

  return res.status(201).send(newData[0]);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const { data  } = await supabase.from("users").select("id").eq("id", id);
  if (!data.length) return res.status(404).send(`User with id ${id} not found`);

  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) return res.status(400).send(JSON.parse(deleteError.message));

  return res.send(`User with id ${id} was deleted`);
});

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

export default router;
