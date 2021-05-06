import createError from 'http-errors';
import dbUpdateBook from '../../db/dbUpdateBook';
import commonMiddleware from '../../lib/commonMiddleware';
import dbGetBookBySeriesIdAndBookId from '../../db/dbGetBookBySeriesIdAndBookId';

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
    console.log(error);
    throw new createError.InternalServerError(error);
  }

}

export const handler = commonMiddleware(patchBook);
