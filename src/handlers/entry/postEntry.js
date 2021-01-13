import validator from '@middy/validator';
import postEntrySchema from '../../schemas/postEntrySchema';
import createError from 'http-errors';
import dbCreateEntry from '../../db/dbCreateEntry';
import commonMiddleware from '../../lib/commonMiddleware';
import dbQueryBookById from '../../db/dbQueryBookById';

async function postEntry(event) {
  const { seriesId, bookId, name, text } = event.body;

  try {
    const book = await dbQueryBookById(seriesId, bookId);
    if (!book) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Book with ID "${bookId}" in "${seriesId}" not found.` }),
      };
    }

    const newEntry = await dbCreateEntry(seriesId, bookId, name, text);

    return {
      statusCode: 201,
      body: JSON.stringify( newEntry ),
    };

  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

}

export const handler = commonMiddleware(postEntry)
  .use(validator({inputSchema: postEntrySchema, useDefaults: true}));
