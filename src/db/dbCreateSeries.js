import AWS from 'aws-sdk';
import generateId from '../lib/base64id';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbCreateSeries(name) {
  const now = new Date();

  const series = {
    primary_key: 'TOP~',
    sort_key: `s${generateId(10)}`,
    name,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  const entry = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Item: series
  };

  await dynamodb.put(entry).promise();

  return series;
}
