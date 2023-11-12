import { Router } from '../myExpress.js';
import accessTokenGuard from '../middlewares/guards/accessTokenGuard.js';
import refreshTokenGuard from '../middlewares/guards/refreshTokenGuard.js';
import {
  getNewAccessToken,
  getProfile,
  updateProfile,
  login,
  logout,
  register,
  searchUsers,
} from '../controllers/user.controller.js';
import { getFollowers, getFollowing } from '../controllers/follows.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', accessTokenGuard, getProfile);
router.put('/profile', accessTokenGuard, updateProfile);
router.post('/logout', accessTokenGuard, logout);
router.post('/refresh', refreshTokenGuard, getNewAccessToken);
router.get('/followers', accessTokenGuard, getFollowers);
router.get('/following', accessTokenGuard, getFollowing);
router.post('/search', accessTokenGuard, searchUsers);

export default router;
