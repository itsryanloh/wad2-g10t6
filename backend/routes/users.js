import express from "express";
import supabase from "../database.js";
import twilio from "twilio";
import { User } from "../schemas/user.js"
import jwt from "jsonwebtoken";
import { Checklist } from "../schemas/checklist.js";

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
  // check if user exists
  const { error: fetchError, data: currentData } = await supabase.from("users").select("*").eq("id", id);
  if (fetchError) return res.status(404).send(`User with id ${id} not found`);

  // check if new fields are valid
  const newUser = { ...currentData[0], ...req.body };
  const { error: parseError } = User.safeParse(newUser);
  if (parseError) return res.status(400).send(JSON.parse(parseError.message));

  // execute update on db
  const { error: updateError, data: newData } = await supabase.from("users").update(newUser).eq("id", id).select();
  if (updateError) return res.status(400).send(JSON.parse(updateError.message));

  return res.status(201).send(newData[0]);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const { data } = await supabase.from("users").select("id").eq("id", id);
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

// Get current user's checklist (protected)
router.get("/me/checklist", async (req, res) => {
  console.log('✅ Checklist route hit');
  const authHeader = req.headers.authorization;

  const { post_id } = req.query

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // console.log('🔑 Received token:', req.headers.authorization);
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);

    // Get user ID from database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("username", payload.username)
      .single();

    if (userError || !userData) {
      return res.status(401).send({ error: 'User not found' });
    }

    // Get checklist items
    const { error, data } = await (async () => {
      let query = supabase
        .from("checklist_items")
        .select("item_index,post_id,posts(title)")
        .eq("user_id", userData.id)
      if (post_id) query = query.eq("post_id", post_id)
      return query
    })();

    if (error) {
      return res.status(400).send(error.message);
    }

    res.send(data);
  } catch (error) {
    return res.status(401).send({ error: 'Invalid token' });
  }
});

// Add checklist item (protected)
router.post("/me/checklist", async (req, res) => {
  const checklist = req.body;

  const { error: parseError } = Checklist.safeParse(checklist);
  if (parseError) return res.status(400).send(JSON.parse(parseError.message));

  try {
    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", checklist.user_id)
      .single();

    if (userError || !userData) {
      return res.status(401).send({ error: 'User not found' });
    }

    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", checklist.post_id)
      .single();

    if (postError || !postData) {
      return res.status(401).send({ error: 'Post not found' });
    }

    // Insert checklist item
    const { error, data } = await supabase
      .from("checklist_items")
      .insert(checklist)
      .select();

    if (error && error.code !== '23505') {
      return res.status(400).send(error.message);
    }

    return res.status(201).send(data || { message: "Item has been checked" });
  } catch (error) {
    return res.status(401).send({ error: 'Invalid token' });
  }
});

// Delete checklist item (protected)
router.delete("/me/checklist/:itemIndex", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);

    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("username", payload.username)
      .single();

    if (userError || !userData) {
      return res.status(401).send({ error: 'User not found' });
    }

    const { itemIndex } = req.params;

    // Delete checklist item
    const { error } = await supabase
      .from("checklist_items")
      .delete()
      .eq("user_id", userData.id)
      .eq("item_index", parseInt(itemIndex));

    if (error) {
      return res.status(400).send(error.message);
    }

    return res.send({ message: "Item unchecked" });
  } catch (error) {
    return res.status(401).send({ error: 'Invalid token' });
    console.error('❌ Checklist error:', err.message);
  }
});

export default router;
