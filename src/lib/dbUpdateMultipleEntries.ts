// Saved for reference. This works, but does not provide any feedback, so I'm not using it.

import type { UpdateItemCommandInput } from '@aws-sdk/client-dynamodb';

import createError from 'http-errors';
import { generateId } from './base64id.js';
import { updateMultipleDbItems } from './dynamodb-client.js';

interface EntryMention {
  entryId?: string;
  name: string;
  [key: string]: unknown;
}

interface EntryList {
  seriesId: string;
  bookId: string;
  mentions: EntryMention[];
  [key: string]: unknown;
}

export async function dbUpdateMultipleEntries(
  entryList: EntryList,
  userId: string,
) {
  try {
    const items: Partial<UpdateItemCommandInput>[] = entryList.mentions.map(
      (entry) => {
        const sortKey = entry.entryId || `e${generateId(9)}`;
        const now = new Date();

        return {
          TableName:
            process.env.NO_SPOILERS_TABLE_NAME || 'NoSpoilersTable-dev',
          Key: {
            primary_key: { S: entryList.seriesId },
            sort_key: { S: sortKey },
          },
          UpdateExpression:
            'set updatedAt = :updatedAt, updatedBy = :updatedBy, #bookId = :bookId, #name = :name',
          ExpressionAttributeNames: {
            '#bookId': 'bookId',
            '#name': 'name',
          },
          ExpressionAttributeValues: {
            ':updatedAt': { S: now.toISOString() },
            ':updatedBy': { S: userId },
            ':bookId': { S: entryList.bookId },
            ':name': { S: entry.name },
          },
        };
      },
    );

    return await updateMultipleDbItems(items);
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ConditionalCheckFailedException'
    ) {
      return null;
    }
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
}
