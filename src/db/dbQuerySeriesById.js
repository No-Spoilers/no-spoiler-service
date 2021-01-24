import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbQuerySeriesById(seriesId) {
  try {
    const result = await dynamodb.get({
      TableName: process.env.NO_SPOILERS_TABLE_NAME,
      Key: {
        primary_key: 'TOP~',
        sort_key: seriesId
      }
    }).promise();

    const series = result.Item;

    if (!series) return null;

    series.seriesId = series.sort_key;
    delete series.primary_key;
    delete series.sort_key;

    return series;

  } catch (error) {
      console.error(error);
      throw new createError.InternalServerError(error);
  }
}