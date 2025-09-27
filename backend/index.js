import 'dotenv/config';
import express from 'express';
import users from './routes/users.js';
import morgan from 'morgan';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.use("/users", users)

app.listen(process.env.PORT, () => {
    console.log(`listening on ${process.env.PORT}`)
})
