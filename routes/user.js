import express from "express";
import { validateDeveloper, validateToken } from "../middleware/auth.js";
import { getAllUsers, getUserDetails } from "../controllers/user.js";

const router = express.Router();

router.get ('/', validateToken, getUserDetails);
router.get ('/all', validateDeveloper, getAllUsers)

export default router;