import { Router } from "express";
import userRouters from "./user.routes.js"

const router = Router();

router.use("/user",userRouters);

export default router;