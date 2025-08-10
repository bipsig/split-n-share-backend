import express from "express";
import { validateDeveloper, validateToken } from "../middleware/authMiddleware.js";
import { deleteAllUsers, deleteUser, getAccessToken, getAllUsers, getUserDetails, getUsersWhoGetsBack, getUsersWhoNeedToPay, getUserTotalBalance, isEmailUnique, searchUser, updateDetails, updatePassword } from "../controllers/userController.js";

const router = express.Router();

router.get ('/me', validateToken, getUserDetails);
router.patch ('/me', validateToken, updateDetails);
router.patch ('/me/password', validateToken, updatePassword)
router.delete ('/me', validateToken, deleteUser);

router.get ('/token', validateToken, getAccessToken);

router.get ('/balance', validateToken, getUserTotalBalance);
router.get ('/owe', validateToken, getUsersWhoNeedToPay);       //Users who owe me 
router.get ('/is-owed', validateToken, getUsersWhoGetsBack);    // Users who is owed by me

router.get ('/is-email-unique', isEmailUnique);
router.get ('/search', searchUser);

router.get ('/all', validateDeveloper, getAllUsers);

router.delete('/all', validateDeveloper, deleteAllUsers);

export default router;