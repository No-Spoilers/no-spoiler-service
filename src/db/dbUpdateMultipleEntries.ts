import createError from 'http-errors';
import generateId from '../lib/base64id.js';
import { updateMultipleDbItems } from '../lib/dynamodb-client.js';

// Saved for reference. This works, but does not provide any feedback, so I'm not using it.
export default async function dbUpdateMultipleEntries(entryList, userId) {
  try {
    const items = entryList.mentions.map(entry => {
      const sortKey = entry.entryId || `e${generateId(9)}`;
      const now = new Date();

      return {
        Key: {
          primary_key: { S: entryList.seriesId },
          sort_key: { S: sortKey }
        },
        UpdateExpression: 'set updatedAt = :updatedAt, updatedBy = :updatedBy, #bookId = :bookId, #name = :name',
        ExpressionAttributeNames: {
          '#bookId': 'bookId',
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':updatedAt': { S: now.toISOString() },
          ':updatedBy': { S: userId },
          ':bookId': { S: entryList.bookId },
          ':name': { S: entry.name }
        },
      }
    });

    return await updateMultipleDbItems(items);

  } catch (error) {
    if(error && error.code && error.code === 'ConditionalCheckFailedException') {
      return null;
    }
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}