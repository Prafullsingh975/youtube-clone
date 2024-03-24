import dotenv from "dotenv";
dotenv.config({path:"../env"});

import { server } from "./app.js";

const PORT = process.env.PORT || 5000;

server.listen(PORT,()=>{
    console.log(`Server is listening on port ${PORT}\nhttp://localhost:${PORT}`);
})