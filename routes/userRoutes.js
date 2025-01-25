import express from "express";
import { validateDeveloper, validateToken } from "../middleware/authMiddleware.js";
import { getAllUsers, getUserDetails } from "../controllers/userController.js";

const router = express.Router();

router.get ('/', validateToken, getUserDetails);
router.get ('/all', validateDeveloper, getAllUsers)

export default router;