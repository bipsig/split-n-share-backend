import express from "express";
import { validateDeveloper, validateToken } from "../middleware/authMiddleware.js";
import { deleteAllActivity, getAllActivities } from "../controllers/activityController.js";

const router = express.Router();

router.get('/all', validateToken, getAllActivities);
router.delete('/all', validateDeveloper, deleteAllActivity);

export default router;