import createError from 'http-errors';
import dbGetBookBySeriesIdAndBookId from '../../db/dbGetBookBySeriesIdAndBookId';
import dbUpsertUserSeriesBook from '../../db/dbUpsertUserSeriesBook';
import commonMiddleware from '../../lib/commonMiddleware';

async function postLevel(event) {
  // Currently only for saving a user's spoiler level in a given series.
  // The book ID represents how far the user has progressed, and therefor
  // what is or isn't a spoiler

  const { token } = event;
  const { seriesId, bookId } = event.body;

  try {
    const book = await dbGetBookBySeriesIdAndBookId(seriesId, bookId);

    if (!book) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Series or Book not found.' }),
      };
    }

    const spoilerState = await dbUpsertUserSeriesBook(token, seriesId, bookId);

    return {
      statusCode: 200,
      body: JSON.stringify( spoilerState ),
    };

  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

}

export const handler = commonMiddleware(postLevel);
