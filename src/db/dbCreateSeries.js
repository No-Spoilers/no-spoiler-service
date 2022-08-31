import AWS from 'aws-sdk';
import generateId from '../lib/base64id.js';

export default async function dbCreateSeries(seriesData, token) {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const now = new Date();

  const series = {
    primary_key: `t${generateId(10)}`,
    sort_key: 'TOP~',
    name: seriesData.name,
    text: seriesData.text,
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
