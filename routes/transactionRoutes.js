import express from "express";
import { validateDeveloper, validateToken } from "../middleware/authMiddleware.js";
import { createTransaction, deleteAllTransactions, deleteTransaction, fetchTransactionDetails, fetchTransactionsOfAGroup } from "../controllers/transactionController.js";

const router = express.Router();

router.delete('/all', validateDeveloper, deleteAllTransactions);

router.post('/', validateToken, createTransaction);
router.get('/groups/:groupId', validateToken, fetchTransactionsOfAGroup);
router.get('/:transactionId', validateToken, fetchTransactionDetails);
router.delete('/:transactionId', validateToken, deleteTransaction);

export default router;