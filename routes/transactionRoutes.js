import express from "express";
import { validateToken } from "../middleware/authMiddleware.js";
import { createTransaction, fetchTransactionDetails, fetchTransactionsOfAGroup } from "../controllers/transactionController.js";

const router = express.Router();

router.post('/', validateToken, createTransaction);
router.get('/groups/:groupId', validateToken, fetchTransactionsOfAGroup);
router.get('/:transactionId', validateToken, fetchTransactionDetails);

export default router;