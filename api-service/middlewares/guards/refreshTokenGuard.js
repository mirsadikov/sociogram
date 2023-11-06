import CustomError from '../../errors/CustomError.js';
import { verifyToken } from '../../utils/tokenService.js';

const refreshTokenGuard = (req, res, next) => {
  try {
    const { refresh_token } = req.cookies;

    if (!refresh_token) return next(new CustomError('Unauthorized', 401));

    const decoded = verifyToken(refresh_token);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      refresh_token,
    };

    next();
  } catch (err) {
    next(new CustomError('Unauthorized', 401));
  }
};

export default refreshTokenGuard;
