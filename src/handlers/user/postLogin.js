import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import validator from '@middy/validator';
import { createNewToken } from '../../lib/token';
import dbQueryUserByEmail from '../../db/dbQueryUserByEmail';
import commonMiddleware from '../../lib/commonMiddleware';
import postLoginSchema from '../../schemas/postLoginSchema';

async function postLogin(event) {
  const { email, password } = event.body;

  try {
    const user = await dbQueryUserByEmail(email);
    if (!user || !user.passwordHash) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: `Problem with email:${email} or password.` })
      };
    }

    const verified = await bcrypt.compare(password, user.passwordHash);
    if (!verified) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: `Problem with email:${email} or password.` }),
      };
    }

    const token = createNewToken(user);

    const returnObject = {
      name: user.name,
      email: user.preservedCaseEmail,
      token
    }

    return {
      statusCode: 200,
      body: JSON.stringify(returnObject)
    };

  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

}

export const handler = commonMiddleware(postLogin)
  .use(validator({inputSchema: postLoginSchema, useDefaults: true}));
