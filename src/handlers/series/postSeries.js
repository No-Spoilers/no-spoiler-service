import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function postSeries(event) {
  const { name } = event.body;
  const now = new Date();

  const series = {
    id: uuid(),
    name,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  const entry = {
    TableName: process.env.SERIES_TABLE_NAME,
    Item: series
  };

  try {
    await dynamodb.put(entry).promise();
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'new item successfully added', series }),
  };
}

export const handler = commonMiddleware(postSeries);
