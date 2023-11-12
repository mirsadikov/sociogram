import prisma from '../prisma/client.js';
import CustomError from '../errors/CustomError.js';

// @Private
async function followUser(req, res, next) {
  try {
    const id = req.body.id;

    const userToFollow = await prisma.user.findUnique({ where: { id } });

    if (!userToFollow) throw new CustomError('User not found', 404);
    if (userToFollow.id === req.user.id) throw new CustomError('You cannot follow yourself', 400);

    await prisma.userFollow.upsert({
      where: {
        follower_id_following_id: {
          follower_id: req.user.id,
          following_id: userToFollow.id,
        },
      },
      update: {},
      create: {
        follower_id: req.user.id,
        following_id: userToFollow.id,
      },
    });

    res.json({ message: `You are now following ${userToFollow.name}`, id: userToFollow.id });
  } catch (error) {
    next(error);
  }
}

// @Private
async function unfollowUser(req, res, next) {
  try {
    const id = req.body.id;

    const userToUnfollow = await prisma.user.findUnique({ where: { id } });

    if (!userToUnfollow) throw new CustomError('User not found', 404);
    if (userToUnfollow.id === req.user.id)
      throw new CustomError('You cannot unfollow yourself', 400);

    await prisma.userFollow.deleteMany({
      where: {
        follower_id: req.user.id,
        following_id: userToUnfollow.id,
      },
    });

    res.json({ message: `You are not following ${userToUnfollow.name} anymore` });
  } catch (error) {
    next(error);
  }
}

// @Private
async function getFollowers(req, res, next) {
  try {
    const { id } = req.user;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new CustomError('User not found', 404);

    const followers = await prisma.userFollow.findMany({
      where: { following_id: user.id },
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
          },
        },
      },
    });

    res.json({
      count: followers.length,
      followers: followers.map((follower) => follower.follower),
    });
  } catch (error) {
    next(error);
  }
}

// @Private
async function getFollowing(req, res, next) {
  try {
    const { id } = req.user;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new CustomError('User not found', 404);

    const following = await prisma.userFollow.findMany({
      where: { follower_id: user.id },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            chats: {
              select: { id: true },
              where: {
                user_id: {
                  equals: id,
                },
              },
            },
          },
        },
      },
    });

    res.json({
      count: following.length,
      following: following.map((follow) => {
        const { chats, ...following } = follow.following;
        return { ...following, chat_id: chats[0]?.id };
      }),
    });
  } catch (error) {
    next(error);
  }
}

export { followUser, unfollowUser, getFollowers, getFollowing };
