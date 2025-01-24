import express from "express";
import { register, login, logout, cleanup } from "../controllers/auth.js";
import { validateDeveloper } from "../middleware/auth.js";

const router = express.Router();

router.post ('/register', register);
router.post ('/login', login);
router.post ('/logout', logout);
router.delete ('/cleanup', validateDeveloper, cleanup)

export default router;