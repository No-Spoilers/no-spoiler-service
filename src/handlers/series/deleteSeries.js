import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddleware from '../../lib/commonMiddleware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function deleteSeries(event) {
  const { seriesId } = event.pathParameters;

  const params = {
    TableName: process.env.SERIES_TABLE_NAME,
    Key: { id: seriesId },
    ReturnValues: 'ALL_OLD'
  };

  let deletedSeries;

  try {
    const result = await dynamodb.delete(params).promise();

    deletedSeries = result.Attributes;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'item successfully deleted', deletedSeries }),
  };
}

export const handler = commonMiddleware(deleteSeries);
