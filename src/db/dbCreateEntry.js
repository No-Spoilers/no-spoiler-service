import generateId from '../lib/base64id.js';
import { putDbItem } from '../lib/dynamodb-client.js';

export default async function dbCreateEntry(entry, userId) {
  const now = new Date().toISOString();

  const newSortKey = `e${generateId(9)}`;;

  const item = {
    primary_key: entry.seriesId,
    sort_key: newSortKey,
    name: entry.name,
    text: { key: entry.bookId, value: entry.text },
    createdBy: userId,
    createdAt: now,
    updatedAt: now
  };

  // TODO: Add check and retry for collisions:
  // {
  //   TableName: process.env.NO_SPOILERS_TABLE_NAME,
  //   Item: item
  //   ConditionExpression: 'primary_key <> :primary_key AND sort_key <> :sort_key',
  //   ExpressionAttributeValues: {':primary_key': entry.primary_key, ':sort_key': entry.sort_key}
  // }

  await putDbItem(item);

  item.seriesId = item.primary_key;
  item.entryId = item.sort_key;
  delete item.primary_key;
  delete item.sort_key;

  return item;
}