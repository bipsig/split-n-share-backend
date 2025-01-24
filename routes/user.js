import express from "express";
import { validateToken } from "../middleware/auth.js";
import { getUserDetails } from "../controllers/users.js";

const router = express.Router();

router.get ('/', validateToken, getUserDetails);

export default router;