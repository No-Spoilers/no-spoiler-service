import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import createError from 'http-errors';
import validator from '@middy/validator';
import { patchEntrySchema } from '../../schemas/patchEntrySchema.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { dbGetEntryBySeriesIdAndEntryId } from '../../db/dbGetEntryBySeriesIdAndEntryId.js';
import { dbUpdateEntry } from '../../db/dbUpdateEntry.js';

interface NewEntryData {
  seriesId: string;
  entryId: string;
  bookId: string;
  text: string;
  [key: string]: unknown;
}

interface PatchEntryEvent extends AuthLambdaEvent {
  body: NewEntryData;
}

async function patchEntry(event: PatchEntryEvent) {
  const newEntry = event.body;
  const { token } = event;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }

  try {
    const entry = await dbGetEntryBySeriesIdAndEntryId(
      newEntry.seriesId,
      newEntry.entryId,
    );
    if (!entry) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Entry with ID "${newEntry.entryId}" in "${newEntry.seriesId}" not found.`,
        }),
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

export const handler = commonMiddleware(patchEntry).use(
  validator({ eventSchema: patchEntrySchema }),
);
