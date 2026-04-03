import express from "express";
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { serve } from './ingest/index.js';


const app = express();

await connectDB();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/api/inngest', serve({ client: inngest, functions }));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});