import LIVR from 'livr';
import argon from 'argon2';
import prisma from '../prisma/client.js';
import CustomError from '../errors/CustomError.js';
import ValidationError from '../errors/ValidationError.js';
import { createTokens } from '../utils/tokenService.js';
import { SEVEN_DAYS } from '../config/constants.js';

// @Public
async function register(req, res, next) {
  try {
    const validator = new LIVR.Validator({
      name: ['string', 'trim', 'required', { min_length: 3 }, { max_length: 64 }],
      email: ['string', 'trim', 'required', 'email'],
      password: ['string', 'trim', 'required', { min_length: 6 }],
    });

    const validData = validator.validate(req.body);
    if (!validData) throw new ValidationError(validator.getErrors());

    const userExists = await prisma.user.findUnique({
      where: { email: validData.email.toLowerCase() },
    });

    if (userExists) throw new CustomError('User already exists', 409);

    const user = await prisma.user.create({
      data: {
        name: validData.name,
        email: validData.email.toLowerCase(),
        password: await argon.hash(validData.password),
      },
    });

    const { access_token, refresh_token } = createTokens(user.id, user.email);

    await updateRefreshToken(user.id, refresh_token);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: SEVEN_DAYS * 1000,
    });

    res.json({ access_token });
  } catch (error) {
    next(error);
  }
}

// @Public
async function login(req, res, next) {
  try {
    const validator = new LIVR.Validator({
      email: ['string', 'trim', 'required', 'email'],
      password: ['string', 'trim', 'required'],
    });

    const validData = validator.validate(req.body);
    if (!validData) throw new ValidationError(validator.getErrors());

    const user = await prisma.user.findUnique({
      where: { email: validData.email.toLowerCase() },
    });

    if (!user) throw new CustomError('User not found', 404);

    const isPasswordCorrect = await argon.verify(user.password, validData.password);
    if (!isPasswordCorrect) throw new CustomError('Invalid password', 400);

    const { access_token, refresh_token } = createTokens(user.id, user.email);
    await updateRefreshToken(user.id, refresh_token);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: SEVEN_DAYS,
    });

    res.json({ access_token });
  } catch (error) {
    next(error);
  }
}

// @Private
async function getProfile(req, res, next) {
  try {
    const { id, email } = req.user;

    const user = await prisma.user.findUnique({
      where: { id, email },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        created_at: true,
        _count: {
          select: { followers: true, following: true },
        },
      },
    });

    if (!user) throw new CustomError('User not found', 404);

    res.json({
      ...user,
      followers: user._count.followers,
      following: user._count.following,
      _count: undefined,
    });
  } catch (error) {
    next(error);
  }
}

// @Private
async function updateProfile(req, res, next) {
  try {
    const { id, email } = req.user;

    const validator = new LIVR.Validator({
      name: ['string', 'trim', { min_length: 3 }, { max_length: 64 }],
      bio: ['string', 'trim', { max_length: 255 }],
    });

    const validData = validator.validate(req.body);
    if (!validData) throw new ValidationError(validator.getErrors());

    const user = await prisma.user.findUnique({
      where: { id, email },
      select: { id: true, name: true, bio: true },
    });

    if (!user) throw new CustomError('User not found', 404);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name: validData.name, bio: validData.bio },
      select: { id: true, name: true, email: true, bio: true, created_at: true },
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
}

// @Private
async function logout(req, res, next) {
  try {
    const { id, email } = req.user;

    await prisma.user.update({
      where: { id, email },
      data: { refresh_token: null },
    });

    res.clearCookie('refresh_token');

    res.end();
  } catch (error) {
    next(error);
  }
}

// @Private
async function getNewAccessToken(req, res, next) {
  try {
    const { id, email, refresh_token } = req.user;

    const user = await prisma.user.findUnique({
      where: { id, email },
      select: { refresh_token: true },
    });

    if (!user || !user.refresh_token) throw new CustomError('Unauthorized', 401);

    const isRefreshTokenValid = await argon.verify(user.refresh_token, refresh_token);
    if (!isRefreshTokenValid) throw new CustomError('Unauthorized', 401);

    const { access_token, refresh_token: new_refresh_token } = createTokens(id, email);

    await updateRefreshToken(id, new_refresh_token);

    res.cookie('refresh_token', new_refresh_token, {
      httpOnly: true,
      maxAge: SEVEN_DAYS,
    });

    res.json({ access_token });
  } catch (error) {
    res.clearCookie('refresh_token');
    next(error);
  }
}

// @Private
async function searchUsers(req, res, next) {
  try {
    const { search } = req.query;
    const { id } = req.user;

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
        NOT: { id },
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        created_at: true,
        followers: {
          select: { id: true },
          where: {
            follower_id: {
              equals: id,
            },
          },
        },
      },
      take: 20,
    });

    res.json({
      count: users.length,
      users: users
        .map((user) => ({
          ...user,
          is_following: user.followers.length > 0,
          followers: undefined,
        }))
        .sort((a, b) => b.is_following - a.is_following),
    });
  } catch (error) {
    next(error);
  }
}

// @Helper
async function updateRefreshToken(id, refreshToken) {
  const hashedRefreshToken = await argon.hash(refreshToken);
  await prisma.user.update({
    where: { id },
    data: { refresh_token: hashedRefreshToken },
  });
}

export { register, login, getProfile, updateProfile, logout, getNewAccessToken, searchUsers };
