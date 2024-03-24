import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import rootRoute from "./routes/index.routes.js";

const server = express();

server.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
server.use(express.json({limit:"16kb"}));
server.use(express.urlencoded({extended:true,limit:"16kb"}));
server.use(express.static("public"));
server.use(cookieParser())

server.use('/api/v1',rootRoute);

export {server}