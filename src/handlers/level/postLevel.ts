import createError from 'http-errors';
import dbGetBookBySeriesIdAndBookId from '../../db/dbGetBookBySeriesIdAndBookId.js';
import dbUpdateUserLevel from '../../db/dbUpdateUserLevel.js';
import commonMiddleware, { HandlerEvent, HandlerResponse } from '../../lib/commonMiddleware.js';

interface PostLevelBody {
  seriesId: string;
  bookId: string;
  [key: string]: unknown;
}

interface PostLevelEvent extends HandlerEvent {
  body: PostLevelBody;
  token?: {
    sub: string;
    userId: string;
    email: string;
    [key: string]: unknown;
  };
}

async function postLevel(event: PostLevelEvent): Promise<HandlerResponse> {
  // Currently only for saving a user's spoiler level in a given series.
  // The book ID represents how far the user has progressed, and therefor
  // what is or isn't a spoiler

  const { token } = event;
  const { seriesId, bookId } = event.body;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }

  try {
    if (bookId !== '') {
      const book = await dbGetBookBySeriesIdAndBookId(seriesId, bookId);

      if (!book) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Series or Book not found.' }),
        };
      }
    }

    const spoilerState = await dbUpdateUserLevel(token, seriesId, bookId);

    return {
      statusCode: 200,
      body: JSON.stringify(spoilerState),
    };

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
}

export const handler = commonMiddleware(postLevel);
