import CustomError from '../../errors/CustomError.js';
import { verifyToken } from '../../utils/tokenService.js';

const accessTokenGuard = (req, res, next) => {
  try {
    const token = req.headers['x-auth-token'];

    if (!token) return next(new CustomError('Unauthorized', 401));

    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch {
    next(new CustomError('Unauthorized', 401));
  }
};

export default accessTokenGuard;
