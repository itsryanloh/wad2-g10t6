import 'dotenv/config';
import express from 'express';
import users from './routes/users.js';

const app = express();

app.use("/users", users)

app.listen(process.env.PORT, () => {
    console.log(`listening on ${process.env.PORT}`)
})
