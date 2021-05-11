import AWS from 'aws-sdk';
import generateId from '../lib/base64id';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbCreateEntry(entry, userId) {
  const now = new Date();

  const newSortKey = `e${generateId(9)}`;

  const item = {
    primary_key: entry.seriesId,
    sort_key: newSortKey,
    bookId: entry.bookId,
    name: entry.name,
    text: entry.text,
    createdBy: userId,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }

  const params = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Item: item,
    ReturnValues: 'ALL_OLD'
  };

  // TODO: Add check and retry for collisions:
  // {
  //   TableName: process.env.NO_SPOILERS_TABLE_NAME,
  //   Item: item
  //   ConditionExpression: 'primary_key <> :primary_key AND sort_key <> :sort_key',
  //   ExpressionAttributeValues: {':primary_key': entry.primary_key, ':sort_key': entry.sort_key}
  // }

  await dynamodb.put(params).promise();

  item.seriesId = item.primary_key;
  item.entryId = item.sort_key;
  delete item.primary_key;
  delete item.sort_key;

  return item;
}