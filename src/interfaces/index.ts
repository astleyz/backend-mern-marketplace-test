import type { ConfigType } from '../config';
import type { CourseSchemaType } from '../models/course';

export type LoginCreds = {
  email: string;
  password: string;
  rememberme: boolean;
};

export type RegisterCreds = {
  login: string;
  email: string;
  password: string;
  repeatPassword: string;
};

export type TokenPayload = {
  type: ConfigType['jwt']['access']['type'] | ConfigType['jwt']['refresh']['type'];
  userId: string;
};

export type PutchingCourseType = CourseSchemaType & {
  instructor?: {
    names?: string[];
    jobs?: string[];
  };
  private?: boolean;
  accessedUser?: string;
};
