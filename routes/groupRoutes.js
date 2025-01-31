import express from "express";
import { validateToken } from "../middleware/authMiddleware.js";
import { createGroup, fetchGroups } from "../controllers/groupController.js";

const router = express.Router();

router.post('/', validateToken, createGroup);
router.get('/my-groups', validateToken, fetchGroups);

export default router;