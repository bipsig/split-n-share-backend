import express from "express";
import { validateDeveloper, validateToken } from "../middleware/authMiddleware.js";
import { deleteAllUsers, deleteUser, getAccessToken, getAllTransactions, getAllUsers, getFinancialSummary, getGroupsSummary, getRecentTransactions, getUserDetails, isEmailUnique, searchUser, updateDetails, updatePassword } from "../controllers/userController.js";

const router = express.Router();

router.get ('/me', validateToken, getUserDetails);
router.patch ('/me', validateToken, updateDetails);
router.patch ('/me/password', validateToken, updatePassword)
router.delete ('/me', validateToken, deleteUser);

router.get ('/token', validateToken, getAccessToken);

router.get ('/financial-summary', validateToken, getFinancialSummary);
router.get ('/groups-summary', validateToken, getGroupsSummary);
router.get ('/recent-transactions', validateToken, getRecentTransactions);

router.get ('/all-transactions', validateToken, getAllTransactions);

router.get ('/is-email-unique', isEmailUnique);
router.get ('/search', searchUser);

router.get ('/all', validateDeveloper, getAllUsers);

router.delete('/all', validateDeveloper, deleteAllUsers);

export default router;