import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import validator from '@middy/validator';
import { createNewToken } from '../../lib/token.js';
import dbQueryUserByEmail from '../../db/dbQueryUserByEmail.js';
import commonMiddleware, {
  HandlerEvent,
  HandlerResponse,
} from '../../lib/commonMiddleware.js';
import postLoginSchema from '../../schemas/postLoginSchema.js';

interface LoginBody {
  email: string;
  password: string;
}

interface LoginEvent extends HandlerEvent {
  body: LoginBody;
}

interface LoginResponse {
  name: string;
  email: string;
  token: string;
}

interface DbUser {
  userId: string;
  name: string;
  preservedCaseEmail: string;
  passwordHash: string;
  [key: string]: unknown;
}

async function postLogin(event: LoginEvent): Promise<HandlerResponse> {
  const { email, password } = event.body;

  try {
    const user = await dbQueryUserByEmail(email);
    if (!user || !user.passwordHash) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: `Problem with email:${email} or password.`,
        }),
      };
    }

    const verified = await bcrypt.compare(password, user.passwordHash);
    if (!verified) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: `Problem with email:${email} or password.`,
        }),
      };
    }

    const dbUser: DbUser = {
      userId: user.userId,
      name: user.name,
      preservedCaseEmail: user.preservedCaseEmail,
      passwordHash: user.passwordHash,
    };

    const token = createNewToken(dbUser);

    const returnObject: LoginResponse = {
      name: dbUser.name,
      email: dbUser.preservedCaseEmail,
      token,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(returnObject),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
}

export const handler = commonMiddleware(postLogin).use(
  validator({ eventSchema: postLoginSchema }),
);
