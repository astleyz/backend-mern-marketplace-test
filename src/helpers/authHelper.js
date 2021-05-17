import jwt from 'jsonwebtoken';
import config from '../config.js';
import Token from '../models/token.js';

export const generateAccessToken = userId => {
  const payload = { userId, type: config.jwt.access.type };
  const options = { expiresIn: config.jwt.access.expiresIn };
  const secret = process.env.JWT_ACCESS_SECRET;
  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (userId, extendMaxAge) => {
  const payload = { userId, type: config.jwt.refresh.type };
  const options = {
    expiresIn: extendMaxAge ? config.jwt.refresh.extendedMaxAge : config.jwt.refresh.expiresIn,
  };
  const secret = process.env.JWT_REFRESH_SECRET;
  return jwt.sign(payload, secret, options);
};

export const saveToDBRefreshToken = async (newToken, userId) => {
  try {
    const dbToken = new Token({ token: newToken, userId });
    await dbToken.save();
  } catch (e) {
    Token.deleteOne({ token: newToken }).catch(err => console.log(err.message));
    throw e;
  }
};
