import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import validator from '@middy/validator';
import { patchEntrySchema } from '../../schemas/patchEntrySchema.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { dbUpdateEntry } from '../../db/dbUpdateEntry.js';
import { getDbItem } from '../../lib/dynamodb-client.js';
import {
  extractStringValue,
  extractTextValue,
  internalServerError,
} from '../../lib/utils.js';

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
  const { seriesId, entryId } = event.body;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }
  if (!seriesId || !entryId) {
    return {
      statusCode: 400,
      body: { error: 'Series and entry IDs are required.' },
    };
  }

  try {
    const entry = await getDbItem(seriesId, entryId);
    if (!entry) {
      return {
        statusCode: 400,
        body: {
          error: `Entry with ID "${entryId}" in "${seriesId}" not found.`,
        },
      };
    }

    const entryRecord = {
      seriesId: extractStringValue(entry.primary_key),
      entryId: extractStringValue(entry.sort_key),
      text: extractTextValue(entry.text),
    };

    const result = await dbUpdateEntry(entryRecord, newEntry, token.sub);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    throw internalServerError(error);
  }
}

export const handler = commonMiddleware(patchEntry).use(
  validator({ eventSchema: patchEntrySchema }),
);
