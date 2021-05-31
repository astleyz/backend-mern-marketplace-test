import type { IUserSchema } from './models/user';

declare module 'express-serve-static-core' {
  export interface Request {
    user?: IUserSchema;
  }
}
