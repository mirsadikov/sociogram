import LIVR from 'livr';
import prisma from '../prisma/client.js';
import ValidationError from '../errors/ValidationError.js';
import CustomError from '../errors/CustomError.js';
import { stream } from '../kafka/producer.js';

// @Private
async function createPost(req, res, next) {
  try {
    const validator = new LIVR.Validator({
      content: ['string', 'trim', 'required', { min_length: 1 }],
    });

    const validData = validator.validate(req.body);
    if (!validData) throw new ValidationError(validator.getErrors());

    const post = await prisma.post.create({
      data: {
        author_id: req.user.id,
        content: validData.content,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
}

// @Private
async function getOwnPosts(req, res, next) {
  try {
    const posts = await prisma.post.findMany({
      where: { author_id: req.user.id },
      // like count
      include: {
        _count: {
          select: { likes: true },
        },
      },
    });

    res.json({
      count: posts.length,
      posts: posts.map((post) => ({
        ...post,
        like_count: post._count.likes,
        _count: undefined,
      })),
    });
  } catch (error) {
    next(error);
  }
}

// @Private
async function updatePost(req, res, next) {
  try {
    const validator = new LIVR.Validator({
      id: ['required', 'string', 'trim'],
      content: ['string', 'trim', 'required', { min_length: 1 }],
    });

    const validData = validator.validate(req.body);
    if (!validData) throw new ValidationError(validator.getErrors());

    const post = await prisma.post.update({
      where: { id: validData.id, author_id: req.user.id },
      data: {
        content: validData.content,
      },
    });

    res.json(post);
  } catch (error) {
    next(error);
  }
}

// @Private
async function deletePost(req, res, next) {
  try {
    const validData = validator.validate(req.body);
    if (!validData) throw new ValidationError(validator.getErrors());

    await prisma.post.delete({
      where: { id: validData.id, author_id: req.user.id },
    });

    res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
}

// @Private
async function getPost(req, res, next) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.body.id },
      include: { author: true, _count: { select: { likes: true } } },
    });

    if (!post) throw new CustomError('Post not found', 404);

    res.json({
      ...post,
      like_count: post._count.likes,
      _count: undefined,
    });
  } catch (error) {
    next(error);
  }
}

// @Private
async function getFeed(req, res, next) {
  try {
    const followings = await prisma.userFollow.findMany({
      where: { follower_id: req.user.id },
      select: { following_id: true },
    });

    // get posts of friends
    const posts = await prisma.post.findMany({
      where: {
        author_id: {
          in: followings.map((following) => following.following_id),
        },
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { likes: true } },
        likes: {
          where: { user_id: req.user.id },
          select: { user_id: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({
      count: posts.length,
      posts: posts.map((post) => ({
        ...post,
        like_count: post._count.likes,
        liked: post.likes.length > 0,
        _count: undefined,
        likes: undefined,
      })),
    });
  } catch (error) {
    next(error);
  }
}

// @Private
async function likePost(req, res, next) {
  try {
    const id = req.body.id;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new CustomError('Post not found', 404);

    const like = await prisma.postLike.upsert({
      where: { post_id_user_id: { post_id: id, user_id: req.user.id } },
      create: { post_id: id, user_id: req.user.id },
      update: {},
    });

    const sender = await prisma.user.findUnique({
      select: {
        id: true,
        name: true,
        email: true,
      },
      where: { id: req.user.id },
    });

    stream({
      type: 'like',
      sender,
      receiver_id: post.author_id,
      created_at: like.liked_at,
    });

    res.json(like);
  } catch (error) {
    next(error);
  }
}

// @Private
async function unlikePost(req, res, next) {
  try {
    const id = req.body.id;

    const postLike = await prisma.postLike.findUnique({
      where: { post_id_user_id: { post_id: id, user_id: req.user.id } },
    });

    if (postLike)
      await prisma.postLike.delete({
        where: { post_id_user_id: { post_id: id, user_id: req.user.id } },
      });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export { createPost, deletePost, getFeed, getOwnPosts, getPost, updatePost, likePost, unlikePost };
