import createError from 'http-errors';
import commonMiddleware from '../../lib/commonMiddleware';
import dbGetEntryBySeriesIdAndEntryId from '../../db/dbGetEntryBySeriesIdAndEntryId';
import dbUpdateEntry from '../../db/dbUpdateEntry';

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
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(patchEntry);
