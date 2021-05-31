import jwt from 'jsonwebtoken';
import config from '../config';
import Token, { ITokenSchema } from '../models/token';
import type { TokenPayload } from '../interfaces';

interface IUpdateTokens {
  (userId: string, extendRefreshTokenMaxAge?: boolean): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
}

const generateAccessToken = (userId: string): string => {
  const payload: TokenPayload = { userId, type: config.jwt.access.type };
  const options = { expiresIn: config.jwt.access.expiresIn };
  const secret = process.env.JWT_ACCESS_SECRET!;
  return jwt.sign(payload, secret, options);
};

const generateRefreshToken = (userId: string, extendMaxAge: boolean): string => {
  const payload: TokenPayload = { userId, type: config.jwt.refresh.type };
  const options = {
    expiresIn: extendMaxAge ? config.jwt.refresh.extendedMaxAge : config.jwt.refresh.expiresIn,
  };
  const secret = process.env.JWT_REFRESH_SECRET!;
  return jwt.sign(payload, secret, options);
};

const saveToDBRefreshToken = async (newToken: string, userId: string): Promise<void> => {
  try {
    const dbToken: ITokenSchema = new Token({ token: newToken, userId });
    await dbToken.save();
  } catch (e) {
    Token.deleteOne({ token: newToken }).catch(() => void 0);
    throw e;
  }
};

export const updateTokens: IUpdateTokens = async (userId, extendRefreshTokenMaxAge = false) => {
  const accessToken: string = generateAccessToken(userId);
  const refreshToken: string = generateRefreshToken(userId, extendRefreshTokenMaxAge);
  await saveToDBRefreshToken(refreshToken, userId);
  return { accessToken, refreshToken };
};
