import express from "express";
import { validateToken } from "../middleware/authMiddleware.js";
import { getAllActivities } from "../controllers/activityController.js";

const router = express.Router();

router.get('/all', validateToken, getAllActivities);

export default router;