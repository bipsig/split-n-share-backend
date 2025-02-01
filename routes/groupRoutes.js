import express from "express";
import { validateToken } from "../middleware/authMiddleware.js";
import { addMembersToGroup, createGroup, deleteGroup, fetchGroupDetails, fetchGroups } from "../controllers/groupController.js";

const router = express.Router();

router.post('/', validateToken, createGroup);
router.get('/my-groups', validateToken, fetchGroups);

router.get ('/:groupId', validateToken, fetchGroupDetails);
router.post ('/:groupId/members', validateToken, addMembersToGroup);
router.delete ('/:groupId', validateToken, deleteGroup);

export default router;