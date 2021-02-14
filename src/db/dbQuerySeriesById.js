import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbQuerySeriesById(seriesId) {
  const params = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames:{
        '#pk': 'primary_key'
    },
    ExpressionAttributeValues: {
        ':pk': seriesId
    }
  };

  try {
    const result = await dynamodb.query(params).promise();

    const series = result.Items;

    if (!series || series.length == 0) return null;

    series.forEach(item => {
      item.seriesId = item.primary_key;
      switch (item.sort_key.charAt(0)) {
        case 'T':
          break;

        case 'b':
          item.bookId = item.sort_key;
          break;

        case 'e':
          item.entryId = item.sort_key;
          break;

        default:
          break;
      }
      delete item.primary_key;
      delete item.sort_key;
    })

    return series;

  } catch (error) {
      console.error(error);
      throw new createError.InternalServerError(error);
  }
}