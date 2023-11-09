import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/secrets.js';
import { ONE_HOUR, SEVEN_DAYS } from '../config/constants.js';

function createTokens(id, email) {
  const access_token = jwt.sign({ id, email }, JWT_SECRET, {
    // expiresIn: ONE_HOUR / 1000,
    expiresIn: 10 * 60 * 60,
  });

  const refresh_token = jwt.sign(
    {
      id,
      email,
    },
    JWT_SECRET,
    {
      // expiresIn: SEVEN_DAYS / 1000,
      expiresIn: 60 * 60 * 60,
    }
  );
  return { access_token, refresh_token };
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export { createTokens, verifyToken };
