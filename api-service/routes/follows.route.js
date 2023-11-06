import { Router } from 'express';
import accessTokenGuard from '../middlewares/guards/accessTokenGuard.js';
import { followUser, unfollowUser } from '../controllers/follows.controller.js';

const router = Router();

router.post('/:id', accessTokenGuard, followUser);
router.delete('/:id', accessTokenGuard, unfollowUser);

export default router;
