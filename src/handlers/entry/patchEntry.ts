import createError from 'http-errors';
import patchEntrySchema from '../../schemas/patchEntrySchema.js';
import commonMiddleware, { HandlerEvent, HandlerContext, HandlerResponse } from '../../lib/commonMiddleware.js';
import dbGetEntryBySeriesIdAndEntryId from '../../db/dbGetEntryBySeriesIdAndEntryId.js';
import dbUpdateEntry from '../../db/dbUpdateEntry.js';
import validator from '@middy/validator';

interface NewEntryData {
  seriesId: string;
  entryId: string;
  bookId: string;
  text: string;
  [key: string]: unknown;
}

interface PatchEntryEvent extends HandlerEvent {
  body: NewEntryData;
  token?: {
    sub: string;
    userId: string;
    email: string;
    [key: string]: unknown;
  };
}

async function patchEntry(event: PatchEntryEvent, _context: HandlerContext): Promise<HandlerResponse> {
  const newEntry = event.body;
  const { token } = event;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }

  try {
    const entry = await dbGetEntryBySeriesIdAndEntryId(newEntry.seriesId, newEntry.entryId);
    if (!entry) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Entry with ID "${newEntry.entryId}" in "${newEntry.seriesId}" not found.` }),
      };
    }

    const result = await dbUpdateEntry(entry, newEntry, token.sub);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
}

export const handler = commonMiddleware(patchEntry)
  .use(validator({ eventSchema: patchEntrySchema }));
