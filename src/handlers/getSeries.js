import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getData() {
  let seriesList;

  const params = {
    TableName: process.env.SERIES_TABLE_NAME
  };

  try {
    const result = await dynamodb.scan(params).promise();

    seriesList = result.Items;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(seriesList),
  };
}

export const handler = getData;
