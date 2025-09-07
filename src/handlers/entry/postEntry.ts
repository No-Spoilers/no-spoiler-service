import validator from '@middy/validator';
import postEntrySchema from '../../schemas/postEntrySchema.js';
import createError from 'http-errors';
import dbCreateEntry from '../../db/dbCreateEntry.js';
import commonMiddleware, { HandlerEvent, HandlerResponse } from '../../lib/commonMiddleware.js';
import dbGetBookBySeriesIdAndBookId from '../../db/dbGetBookBySeriesIdAndBookId.js';

interface EntryData {
  seriesId: string;
  bookId: string;
  name: string;
  text: string;
  [key: string]: unknown;
}

interface PostEntryEvent extends HandlerEvent {
  body: EntryData;
  token?: {
    sub: string;
    userId: string;
    email: string;
    [key: string]: unknown;
  };
}

async function postEntry(event: PostEntryEvent): Promise<HandlerResponse> {
  const entryData = event.body;
  const { token } = event;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }

  try {
    const book = await dbGetBookBySeriesIdAndBookId(entryData.seriesId, entryData.bookId);
    if (!book) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Book with ID "${entryData.bookId}" in "${entryData.seriesId}" not found.` }),
      };
    }

    const newEntry = await dbCreateEntry(entryData, token.sub);

    return {
      statusCode: 201,
      body: JSON.stringify(newEntry),
    };

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
}

export const handler = commonMiddleware(postEntry)
  .use(validator({ eventSchema: postEntrySchema }));
