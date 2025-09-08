import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import createError from 'http-errors';
import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { dbUpdateBook } from '../../db/dbUpdateBook.js';
import { dbGetBookBySeriesIdAndBookId } from '../../db/dbGetBookBySeriesIdAndBookId.js';

interface PathParameters {
  seriesId: string;
  bookId: string;
  [key: string]: string;
}

interface BookUpdateData {
  name?: string;
  text?: string;
  pubDate?: string;
  seriesId: string;
  bookId: string;
  [key: string]: unknown;
}

interface PatchBookEvent extends AuthLambdaEvent {
  pathParameters: PathParameters;
  body: Partial<BookUpdateData>;
}

async function patchBook(event: PatchBookEvent) {
  const { token } = event;
  const { seriesId, bookId } = event.pathParameters;
  const foo = event.body;

  const bookData: BookUpdateData = {
    ...foo,
    seriesId,
    bookId,
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
        body: JSON.stringify({
          error: `Book with ID "${seriesId}/${bookId}" not found.`,
        }),
      };
    }

    const newBook = await dbUpdateBook(bookData, token);

    return {
      statusCode: 200,
      body: JSON.stringify(newBook),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
}

export const handler = commonMiddleware(patchBook);
