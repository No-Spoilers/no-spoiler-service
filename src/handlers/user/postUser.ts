import validator from '@middy/validator';
import postUserSchema from '../../schemas/postUserSchema.js';
import createError from 'http-errors';
import dbCreateUser from '../../db/dbCreateUser.js';
import commonMiddleware, { HandlerEvent, HandlerResponse } from '../../lib/commonMiddleware.js';
import { createNewToken } from '../../lib/token.js';
import { transpileSchema } from '@middy/validator/transpile';

interface PostUserBody {
  name: string;
  email: string;
  password: string;
}

interface PostUserEvent extends HandlerEvent {
  body: PostUserBody;
}

interface UserResponse {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  token: string;
  [key: string]: unknown;
}

async function postUser(event: PostUserEvent): Promise<HandlerResponse> {
  const { name, email, password } = event.body;

  try {
    const user = await dbCreateUser(name, email, password);

    if (user && 'existing' in user && user.existing) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: `User with email:${email} already exists.` }),
      };
    }

    if (!('userId' in user)) {
      throw new Error('Failed to create user');
    }

    // Create a user object compatible with createNewToken
    const userForToken = {
      userId: user.userId as string,
      name: user.name as string,
      email: user.email as string,
      createdAt: user.createdAt as string
    };

    const token = createNewToken(userForToken);

    const returnObject: UserResponse = {
      userId: user.userId as string,
      name: user.name as string,
      email: user.email as string,
      createdAt: user.createdAt as string,
      token
    };

    return {
      statusCode: 201,
      body: JSON.stringify(returnObject),
    };

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
}

export const handler = commonMiddleware(postUser)
  .use(validator({ eventSchema: transpileSchema(postUserSchema) }));
