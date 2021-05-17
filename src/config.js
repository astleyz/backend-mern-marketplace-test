export default {
  jwt: {
    access: {
      type: 'access',
      expiresIn: '10m',
    },
    refresh: {
      type: 'refresh',
      expiresIn: '1d',
      extendedMaxAge: '10d',
    },
  },
  refreshCookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1d
    extendedMaxAge: 1000 * 60 * 60 * 24 * 10, // 10d
    httpOnly: true,
    path: '/auth',
  },
};
