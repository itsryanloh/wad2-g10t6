import express from "express";
import supabase from "../database.js";
import twilio from "twilio";

const router = express.Router();
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)

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
