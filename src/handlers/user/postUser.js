import validator from '@middy/validator';
import postUserSchema from '../../schemas/postUserSchema';
import createError from 'http-errors';
import dbCreateUser from '../../db/dbCreateUser';
import commonMiddleware from '../../lib/commonMiddleware';

async function postUser(event) {
  const { name } = event.body;

  try {
    const newUser = await dbCreateUser(name);

    return {
      statusCode: 201,
      body: JSON.stringify( newUser ),
    };

  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

}

export const handler = commonMiddleware(postUser)
  .use(validator({inputSchema: postUserSchema, useDefaults: true}));
