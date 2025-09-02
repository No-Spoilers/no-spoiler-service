import createError from 'http-errors';
import dbUpdateBook from '../../db/dbUpdateBook.js';
import commonMiddleware from '../../lib/commonMiddleware.js';
import dbGetBookBySeriesIdAndBookId from '../../db/dbGetBookBySeriesIdAndBookId.js';

async function patchBook(event) {
  const { token } = event;
  const { seriesId, bookId } = event.pathParameters;
  const bookData = {
    ...event.body,
    seriesId,
    bookId
  };

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }

  try {
    const book = await dbGetBookBySeriesIdAndBookId(seriesId, bookId);
    if (!book) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Book with ID "${seriesId}/${bookId}" not found.` }),
      };
    }

    const newBook = await dbUpdateBook(bookData, token);

    return {
      statusCode: 200,
      body: JSON.stringify( newBook ),
    };

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

}

export const handler = commonMiddleware(patchBook);
