import express from "express";
import { validateDeveloper, validateToken } from "../middleware/authMiddleware.js";
import { deleteUser, getAccessToken, getAllUsers, getUserDetails, isEmailUnique, updateDetails, updatePassword } from "../controllers/userController.js";

const router = express.Router();

router.get ('/', validateToken, getUserDetails);
router.put ('/', validateToken, updateDetails);
router.delete ('/', validateToken, deleteUser);
router.get ('/accessToken', validateToken, getAccessToken);
router.get ('/check-email', isEmailUnique);
router.patch ('/change-password', validateToken, updatePassword)
router.get ('/all', validateDeveloper, getAllUsers);

export default router;