import validator from '@middy/validator';
import postUserSchema from '../../schemas/postUserSchema';
import createError from 'http-errors';
import dbCreateUser from '../../db/dbCreateUser';
import commonMiddleware from '../../lib/commonMiddleware';

async function postUser(event) {
  const { name, email, password } = event.body;

  try {
    const result = await dbCreateUser(name, email, password);

    if (result && result.existing) {
      return {
        statusCode: 400,
        body: JSON.stringify( `User with email:${email} already exists.` ),
      };
    }

    const newUser = {
      email: result.preservedCaseEmail,
      name: result.name,
      userId: result.userId,
      createdAt: result.createdAt
    }

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
