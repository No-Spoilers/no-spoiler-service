import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbQuerySeriesById(contentId) {
  const reverseLookup = contentId.split('')[0] === 's' ? false : true;

  const params = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
  };

  if (reverseLookup) {
    params.IndexName = 'ReverseLookup';
    params.KeyConditionExpression = '#sk = :sk';
    params.ExpressionAttributeNames = { '#sk': 'sort_key' };
    params.ExpressionAttributeValues = { ':sk': contentId };
  } else {
    params.KeyConditionExpression = '#pk = :pk';
    params.ExpressionAttributeNames = { '#pk': 'primary_key' };
    params.ExpressionAttributeValues = { ':pk': contentId };
  }

  try {
    const { Items: queryResult } = await dynamodb.query(params).promise();

    if (!queryResult || queryResult.length == 0) return null;

    if (reverseLookup) {
      // always return full series info, even if query was for a book or entry
      return dbQuerySeriesById(queryResult[0].primary_key);
    }

    queryResult.forEach(item => {
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
    });

    return queryResult;

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}