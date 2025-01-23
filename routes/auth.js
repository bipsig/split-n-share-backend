import express from "express";
import { register, login, logout, cleanup } from "../controllers/auth.js";

const router = express.Router();

router.post ('/register', register);
router.post ('/login', login);
router.post ('/logout', logout);
router.delete ('/cleanup', cleanup)

export default router;