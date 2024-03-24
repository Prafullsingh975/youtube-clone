import dotenv from "dotenv";
dotenv.config({path:"../env"});

import { server } from "./app.js";
import { connectDB } from "./db/index.js";

const PORT = process.env.PORT || 5000;

connectDB();

server.listen(PORT,()=>{
    console.log(`Server is listening on port ${PORT}\nhttp://localhost:${PORT}`);
})