import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import validator from '@middy/validator';
import createError from 'http-errors';
import { postBookSchema } from '../../schemas/postBookSchema.js';
import { dbCreateBook } from '../../db/dbCreateBook.js';
import { dbQuerySeriesById } from '../../db/dbQuerySeriesById.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';

interface BookData {
  seriesId: string;
  pubDate: string;
  name: string;
  text: string;
  [key: string]: unknown;
}

interface PostBookEvent extends AuthLambdaEvent {
  body: BookData;
}

async function postBook(event: PostBookEvent) {
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
        body: JSON.stringify({
          error: `Series with ID "${bookData.seriesId}" not found.`,
        }),
      };
    }

    const newBook = await dbCreateBook(bookData, token);

    return {
      statusCode: 201,
      body: JSON.stringify(newBook),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
}

export const handler = commonMiddleware(postBook).use(
  validator({ eventSchema: postBookSchema }),
);
