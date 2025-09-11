import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import validator from '@middy/validator';
import createError from 'http-errors';
import { postEntrySchema } from '../../schemas/postEntrySchema.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { dbGetBookBySeriesIdAndBookId } from '../../db/dbGetBookBySeriesIdAndBookId.js';
import { generateId } from '../../lib/base64id.js';
import { putDbItem } from '../../lib/dynamodb-client.js';

interface EntryRecord {
  primary_key: string;
  sort_key: string;
  name: string;
  text: { key: string; value: string };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface EntryResponse {
  seriesId: string;
  entryId: string;
  name: string;
  text: { key: string; value: string };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface EntryData {
  seriesId: string;
  bookId: string;
  name: string;
  text: string;
  [key: string]: unknown;
}

interface PostEntryEvent extends AuthLambdaEvent {
  body: EntryData;
}

async function postEntry(event: PostEntryEvent) {
  const entryData = event.body;
  const { token } = event;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }

  try {
    const book = await dbGetBookBySeriesIdAndBookId(
      entryData.seriesId,
      entryData.bookId,
    );
    if (!book) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Book with ID "${entryData.bookId}" in "${entryData.seriesId}" not found.`,
        }),
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

export const handler = commonMiddleware(postEntry).use(
  validator({ eventSchema: postEntrySchema }),
);

export async function dbCreateEntry(
  entry: EntryData,
  userId: string,
): Promise<EntryResponse> {
  const now = new Date().toISOString();

  const newSortKey = `e${generateId(9)}`;

  const item: EntryRecord = {
    primary_key: entry.seriesId,
    sort_key: newSortKey,
    name: entry.name,
    text: { key: entry.bookId, value: entry.text },
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  };

  // // TODO: Add check and retry for collisions:
  // {
  //   TableName: process.env.NO_SPOILERS_TABLE_NAME,
  //   Item: item
  //   ConditionExpression: 'primary_key <> :primary_key AND sort_key <> :sort_key',
  //   ExpressionAttributeValues: {':primary_key': entry.primary_key, ':sort_key': entry.sort_key}
  // }

  await putDbItem(item);

  const entryResponse: EntryResponse = {
    seriesId: item.primary_key,
    entryId: item.sort_key,
    name: item.name,
    text: item.text,
    createdBy: item.createdBy,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };

  return entryResponse;
}
