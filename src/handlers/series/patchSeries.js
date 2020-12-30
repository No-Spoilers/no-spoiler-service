import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddleware from '../../lib/commonMiddleware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function patchSeries(event) {
  const { seriesId } = event.pathParameters;
  const { name } = event.body;
  const now = new Date();

  const params = {
    TableName: process.env.SERIES_TABLE_NAME,
    Key: { id: seriesId },
    UpdateExpression: 'set #name = :name, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':name': name,
      ':updatedAt': now.toISOString()
    },
    ExpressionAttributeNames: {
      '#name': 'name'
    },
    ReturnValues: 'ALL_NEW'
  };

  let updatedSeries;

  try {
    const result = await dynamodb.update(params).promise();

    updatedSeries = result.Attributes;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'item successfully updated', updatedSeries }),
  };
}

export const handler = commonMiddleware(patchSeries);
