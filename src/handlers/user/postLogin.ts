import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import validator from '@middy/validator';
import { createNewToken } from '../../lib/token.js';
import dbQueryUserByEmail from '../../db/dbQueryUserByEmail.js';
import commonMiddleware from '../../lib/commonMiddleware.js';
import postLoginSchema from '../../schemas/postLoginSchema.js';

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
    console.error(error);
    throw new createError.InternalServerError(error);
  }

}

export const handler = commonMiddleware(postLogin)
  .use(validator({ inputSchema: postLoginSchema, useDefaults: true }));
