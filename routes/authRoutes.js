import express from "express";
import { register, login, logout, cleanup } from "../controllers/authController.js";
import { validateDeveloper } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post ('/register', register);
router.post ('/login', login);
router.delete ('/logout', logout);
router.delete ('/cleanup', validateDeveloper, cleanup)

export default router;