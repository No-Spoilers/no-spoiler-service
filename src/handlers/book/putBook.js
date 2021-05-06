import validator from '@middy/validator';
import postBookSchema from '../../schemas/postBookSchema';
import createError from 'http-errors';
import dbUpdateBook from '../../db/dbUpdateBook';
import commonMiddleware from '../../lib/commonMiddleware';
import dbQuerySeriesById from '../../db/dbQuerySeriesById';

async function putBook(event) {
  console.log(event);
  const bookData = event.body;
  const { token } = event;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }

  try {
    const series = await dbQuerySeriesById(bookData.seriesId);
    if (!series) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Series with ID "${bookData.seriesId}" not found.` }),
      };
    }

    const newBook = await dbUpdateBook(bookData, token);

    return {
      statusCode: 200,
      body: JSON.stringify( newBook ),
    };

  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

}

export const handler = commonMiddleware(putBook)
  .use(validator({inputSchema: postBookSchema, useDefaults: true}));
