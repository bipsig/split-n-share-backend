import express from "express";
import { validateToken } from "../middleware/authMiddleware.js";
import { createTransaction } from "../controllers/transactionController.js";

const router = express.Router();

router.post('/', validateToken, createTransaction);

export default router;