import express from "express";
import { validateDeveloper, validateToken } from "../middleware/authMiddleware.js";
import { addMembersToGroup, createGroup, deleteAllGroups, deleteGroup, fetchGroupDetails, fetchGroups, removeMembersFromGroup, toggleMemberAdmin } from "../controllers/groupController.js";

const router = express.Router();

router.delete('/all', validateDeveloper, deleteAllGroups);


router.post('/', validateToken, createGroup);
router.get('/my-groups', validateToken, fetchGroups);

router.get ('/:groupId', validateToken, fetchGroupDetails);
router.post ('/:groupId/members', validateToken, addMembersToGroup);
router.patch('/:groupId/members/:username/admin', validateToken, toggleMemberAdmin);
router.delete('/:groupId/members', validateToken, removeMembersFromGroup);
router.delete ('/:groupId', validateToken, deleteGroup);


export default router;