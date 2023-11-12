import { Router } from '../myExpress.js';
import accessTokenGuard from '../middlewares/guards/accessTokenGuard.js';
import {
  createPost,
  deletePost,
  getFeed,
  getOwnPosts,
  getPost,
  likePost,
  unlikePost,
  updatePost,
} from '../controllers/post.controller.js';

const router = Router();

router.post('/user', accessTokenGuard, createPost);
router.get('/user', accessTokenGuard, getOwnPosts);
router.put('/user', accessTokenGuard, updatePost);
router.delete('/user', accessTokenGuard, deletePost);
router.get('/feed', accessTokenGuard, getFeed);
router.get('/one', accessTokenGuard, getPost);
router.post('/like', accessTokenGuard, likePost);
router.post('/unlike', accessTokenGuard, unlikePost);

export default router;
