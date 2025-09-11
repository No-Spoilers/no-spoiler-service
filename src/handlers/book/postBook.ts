import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import validator from '@middy/validator';
import createError from 'http-errors';
import { generateId } from '../../lib/base64id.js';
import { putDbItem } from '../../lib/dynamodb-client.js';
import { postBookSchema } from '../../schemas/postBookSchema.js';
import { dbQuerySeriesById } from '../../db/dbQuerySeriesById.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';

interface TokenData {
  sub: string;
  [key: string]: unknown;
}

interface BookRecord {
  primary_key: string;
  sort_key: string;
  name: string;
  text: string;
  pubDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface BookResponse {
  seriesId: string;
  bookId: string;
  name: string;
  text: string;
  pubDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

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

export async function dbCreateBook(
  bookData: BookData,
  token: TokenData,
): Promise<BookResponse> {
  const now = new Date().toISOString();
  const formattedDate = new Date(bookData.pubDate).toISOString();

  const book: BookRecord = {
    primary_key: bookData.seriesId,
    sort_key: `b${generateId(10)}`,
    name: bookData.name,
    text: bookData.text,
    pubDate: formattedDate,
    createdBy: token.sub,
    createdAt: now,
    updatedAt: now,
  };

  await putDbItem(book);

  const bookResponse: BookResponse = {
    seriesId: book.primary_key,
    bookId: book.sort_key,
    name: book.name,
    text: book.text,
    pubDate: book.pubDate,
    createdBy: book.createdBy,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  };

  return bookResponse;
}
