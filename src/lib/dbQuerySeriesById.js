import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbQuerySeriesById(seriesId) {
  let series;

  try {
      const result = await dynamodb.get({
          TableName: process.env.SERIES_TABLE_NAME,
          Key: { id: seriesId }
      }).promise();

      series = result.Item;
  } catch (error) {
      console.error(error);
      throw new createError.InternalServerError(error);
  }

  return series;
}