import express from "express";
import { validateToken } from "../middleware/authMiddleware.js";
import { createTransaction, fetchTransactionsOfAGroup } from "../controllers/transactionController.js";

const router = express.Router();

router.post('/', validateToken, createTransaction);
router.get('/:groupId', validateToken, fetchTransactionsOfAGroup);

export default router;