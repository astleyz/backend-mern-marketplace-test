import fs from 'fs';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';

const { version } = JSON.parse(fs.readFileSync(path.resolve(path.join('package.json')), 'utf-8'));

export default (req: Request, res: Response, next: NextFunction): void => {
  const send = res.send;
  res.header('Content-Type', 'application/json');
  res.json = <any>function () {
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
    send.apply(res, arguments as any);
  };
  next();
};
