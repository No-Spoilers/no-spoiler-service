import validator from '@middy/validator';
import postUserSchema from '../../schemas/postUserSchema.js';
import createError from 'http-errors';
import dbCreateUser from '../../db/dbCreateUser.js';
import commonMiddleware from '../../lib/commonMiddleware.js';
import { createNewToken } from '../../lib/token.js';

async function postUser(event) {
  const { name, email, password } = event.body;

  try {
    const user = await dbCreateUser(name, email, password);

    if (user && user.existing) {
      return {
        statusCode: 400,
        body: JSON.stringify( `User with email:${email} already exists.` ),
      };
    }

    const token = createNewToken(user);

    const returnObject = {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      token
    }

    return {
      statusCode: 201,
      body: JSON.stringify( returnObject ),
    };

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

}

export const handler = commonMiddleware(postUser)
  .use(validator({ inputSchema: postUserSchema, useDefaults: true }));
