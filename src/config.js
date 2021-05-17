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
    refreshCookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1d
      extendedMaxAge: 1000 * 60 * 60 * 24 * 10, // 10d
      httpOnly: true,
      path: '/auth',
    },
  },
  gotHeaders: {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
    'accept':
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    'connection': 'keep-alive',
    'referer': 'https://www.google.com/search?q=let+me+google+that&oq=let+me+google+that&ie=UTF-8',
    // 'cache-control': 'no-cache',
    // 'pragma': 'no-cache',
    // 'sec-fetch-dest': 'document',
    // 'sec-fetch-mode': 'navigate',
    // 'sec-fetch-site': 'same-origin',
    // 'upgrade-insecure-requests': 1,
  },
};
