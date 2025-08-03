import createError from 'http-errors';
import { updateDbItem } from '../lib/dynamodb-client.js';

export default async function dbUpdateEntry(entry, newEntry, userId) {
  try {
    const now = new Date();

    const newText = {
      ...entry.text,
      [`${newEntry.bookId}`]: newEntry.text
    };

    const params = {
      Key: {
        primary_key: entry.seriesId,
        sort_key: entry.entryId
      },
      UpdateExpression: 'set updatedAt=:updatedAt, updatedBy=:updatedBy, #text=:text',
      ExpressionAttributeNames: {
        '#text': 'text'
      },
      ExpressionAttributeValues: {
        ':updatedAt': now.toISOString(),
        ':updatedBy': userId,
        ':text': newText
      },
    };

    const entry = await updateDbItem(params);

    entry.seriesId = entry.primary_key;
    entry.entryId = entry.sort_key;
    delete entry.primary_key;
    delete entry.sort_key;

    return entry;

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}