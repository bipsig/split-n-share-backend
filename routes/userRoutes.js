import express from "express";
import { validateDeveloper, validateToken } from "../middleware/authMiddleware.js";
import { getAccessToken, getAllUsers, getUserDetails, isEmailUnique, updateDetails } from "../controllers/userController.js";

const router = express.Router();

router.get ('/', validateToken, getUserDetails);
router.put ('/', validateToken, updateDetails);
router.get ('/accessToken', validateToken, getAccessToken);
router.get ('/check-email', isEmailUnique);
router.get ('/all', validateDeveloper, getAllUsers);

export default router;