import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';

import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { patchEntrySchema } from '../../schemas/patchEntrySchema.js';
import { getDbItem, updateDbItem } from '../../lib/dynamodb-client.js';
import {
  extractStringValue,
  extractTextValue,
  internalServerError,
} from '../../lib/utils.js';

interface EntryText {
  [bookId: string]: string;
}

interface EntryData {
  seriesId: string;
  entryId: string;
  text: EntryText;
  [key: string]: unknown;
}

interface EntryUpdateRecord {
  seriesId: string;
  entryId: string;
  text?: EntryText;
  [key: string]: unknown;
}

interface EntryResponse {
  seriesId: string;
  entryId: string;
  text: EntryText;
  updatedAt: string;
  updatedBy: string;
}

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

export const handler = commonMiddleware(patchEntry).use(
  validator({ eventSchema: transpileSchema(patchEntrySchema) }),
);

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

export async function dbUpdateEntry(
  entry: EntryData | EntryUpdateRecord,
  newEntry: NewEntryData,
  userId: string,
): Promise<EntryResponse> {
  try {
    const now = new Date();

    // Both types have the same structure now
    const seriesId = entry.seriesId;
    const entryId = entry.entryId;
    const entryText = entry.text || {};

    const newText: EntryText = {
      ...entryText,
      [`${newEntry.bookId}`]: newEntry.text,
    };

    const params = {
      TableName: process.env.NO_SPOILERS_TABLE_NAME || 'NoSpoilersTable-dev',
      Key: {
        primary_key: { S: seriesId },
        sort_key: { S: entryId },
      },
      UpdateExpression:
        'set updatedAt=:updatedAt, updatedBy=:updatedBy, #text=:text',
      ExpressionAttributeNames: {
        '#text': 'text',
      },
      ExpressionAttributeValues: {
        ':updatedAt': { S: now.toISOString() },
        ':updatedBy': { S: userId },
        ':text': { M: convertToAttributeValue(newText) },
      },
    };

    const updatedEntry = await updateDbItem(params);

    if (!updatedEntry) {
      throw new Error('Failed to update entry');
    }

    const entryResponse: EntryResponse = {
      seriesId: extractStringValue(updatedEntry.primary_key),
      entryId: extractStringValue(updatedEntry.sort_key),
      text: extractTextValue(updatedEntry.text),
      updatedAt: extractStringValue(updatedEntry.updatedAt),
      updatedBy: extractStringValue(updatedEntry.updatedBy),
    };

    return entryResponse;
  } catch (error) {
    throw internalServerError(error);
  }
}

function convertToAttributeValue(
  text: EntryText,
): Record<string, AttributeValue> {
  const result: Record<string, AttributeValue> = {};
  Object.entries(text).forEach(([key, value]) => {
    result[key] = { S: value };
  });
  return result;
}
