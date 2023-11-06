import { Router } from 'express';
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
router.put('/user/:id', accessTokenGuard, updatePost);
router.delete('/user/:id', accessTokenGuard, deletePost);
router.get('/feed', accessTokenGuard, getFeed);
router.get('/:id', accessTokenGuard, getPost);
router.post('/like/:id', accessTokenGuard, likePost);
router.delete('/like/:id', accessTokenGuard, unlikePost);

export default router;
