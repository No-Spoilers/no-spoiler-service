import AWS from 'aws-sdk';
import generateId from '../lib/base64id';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbCreateSeries(name, token) {
  const now = new Date();

  const series = {
    primary_key: `s${generateId(10)}`,
    sort_key: 'TOP~',
    name,
    createdBy: token.sub,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  const entry = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Item: series
  };

  await dynamodb.put(entry).promise();

  series.seriesId = series.primary_key;
  delete series.primary_key;
  delete series.sort_key;

  return series;
}
