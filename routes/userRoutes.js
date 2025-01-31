import express from "express";
import { validateDeveloper, validateToken } from "../middleware/authMiddleware.js";
import { deleteUser, getAccessToken, getAllUsers, getUserDetails, isEmailUnique, searchUser, updateDetails, updatePassword } from "../controllers/userController.js";

const router = express.Router();

router.get ('/me', validateToken, getUserDetails);
router.patch ('/me', validateToken, updateDetails);
router.patch ('/me/password', validateToken, updatePassword)
router.delete ('/me', validateToken, deleteUser);

router.get ('/token', validateToken, getAccessToken);

router.get ('/is-email-unique', isEmailUnique);
router.get ('/search', searchUser);

router.get ('/all', validateDeveloper, getAllUsers);

export default router;