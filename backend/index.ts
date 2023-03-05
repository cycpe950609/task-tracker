import { config } from 'dotenv';
import express, { Express } from 'express';
import authRoute from './auth.route';
import cors  from "cors"

config()//dotnev


const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const BACKEND_PORT = process.env.BACKEND_PORT;
const BACKEND_URL = process.env.BACKEND_URL;
const FRONTEND_URL = process.env.FRONTEND_URL
const FRONTEND_PORT = process.env.FRONTEND_PORT;

console.log(`${BACKEND_URL}:${BACKEND_PORT}`);
const corsOptions = {
    origin: [`${FRONTEND_URL}:${FRONTEND_PORT}`],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    
}


console.log(`Server start at port ${BACKEND_PORT}`);

const app: Express = express();
app.use(cors(corsOptions))

app.use("/api/auth/",cors(corsOptions),authRoute);



app.listen(BACKEND_PORT);