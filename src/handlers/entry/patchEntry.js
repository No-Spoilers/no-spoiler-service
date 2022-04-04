import createError from 'http-errors';
import patchEntrySchema from '../../schemas/patchEntrySchema.js';
import commonMiddleware from '../../lib/commonMiddleware.js';
import dbGetEntryBySeriesIdAndEntryId from '../../db/dbGetEntryBySeriesIdAndEntryId.js';
import dbUpdateEntry from '../../db/dbUpdateEntry.js';
import validator from '@middy/validator';

async function patchEntry(event) {
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
      body: JSON.stringify( result ),
    };

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(patchEntry)
  .use(validator({ inputSchema: patchEntrySchema, useDefaults: true }));
