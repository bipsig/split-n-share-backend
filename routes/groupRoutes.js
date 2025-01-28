import express from "express";
import { validateToken } from "../middleware/authMiddleware.js";
import { createGroup } from "../controllers/groupController.js";

const router = express.Router();

router.post('/', validateToken, createGroup);

export default router;