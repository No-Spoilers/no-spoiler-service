import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import validator from '@middy/validator';
import { createNewToken } from '../../lib/token';
import dbQueryUserById from '../../db/dbQueryUserById';
import commonMiddleware from '../../lib/commonMiddleware';
import postLoginSchema from '../../schemas/postLoginSchema';

async function postLogin(event) {
  const { userId, password } = event.body;

  try {
    const user = await dbQueryUserById(userId);

    const verified = await bcrypt.compare(password, user.passwordHash);
    if (!verified) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Problem with user:${userId} or password.` }),
      };
    }

    const token = await createNewToken(user);

    return {
      statusCode: 201,
      body: JSON.stringify( token ),
    };

  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

}

export const handler = commonMiddleware(postLogin)
  .use(validator({inputSchema: postLoginSchema, useDefaults: true}));
