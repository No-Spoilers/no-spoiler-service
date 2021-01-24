import validator from '@middy/validator';
import postUserSchema from '../../schemas/postUserSchema';
import createError from 'http-errors';
import dbCreateUser from '../../db/dbCreateUser';
import commonMiddleware from '../../lib/commonMiddleware';

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

    return {
      statusCode: 201,
      body: JSON.stringify( user ),
    };

  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

}

export const handler = commonMiddleware(postUser)
  .use(validator({inputSchema: postUserSchema, useDefaults: true}));
