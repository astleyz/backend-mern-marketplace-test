import fs from 'fs';
import path from 'path';

const { version } = JSON.parse(fs.readFileSync(path.resolve(path.join('package.json')), 'utf-8'));

export default (req, res, next) => {
  const send = res.send;
  res.header('Content-Type', 'application/json');
  res.json = function () {
    const [originData] = arguments;
    const apiResponse = {
      jsonapi: { version },
      data: null,
      errors: null,
      meta: null,
    };

    if (res.statusCode >= 400) {
      apiResponse.errors = originData;
    }

    if (res.statusCode >= 200 && res.statusCode < 400) {
      apiResponse.data = originData;
    }
    arguments[0] = JSON.stringify(apiResponse);
    send.apply(res, arguments);
  };
  next();
};
