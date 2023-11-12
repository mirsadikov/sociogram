import { Router } from '../myExpress.js';
import accessTokenGuard from '../middlewares/guards/accessTokenGuard.js';
import { followUser, unfollowUser } from '../controllers/follows.controller.js';

const router = Router();

router.post('/', accessTokenGuard, followUser);
router.delete('/', accessTokenGuard, unfollowUser);

export default router;
