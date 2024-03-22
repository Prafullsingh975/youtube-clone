import express from 'express';
import cookieParser from "cookie-parser";

const server = express();

server.use(express.json({limit:"16kb"}));
server.use(express.urlencoded({extended:true,limit:"16kb"}));
server.use(express.static("public"));
server.use(cookieParser())

export {server}