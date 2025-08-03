import createError from 'http-errors';
import { searchDbItems } from '../lib/dynamodb-client.js';

export default async function dbQuerySeries() {
  try {
    const params = {
      IndexName: 'ReverseLookup',
      KeyConditionExpression: '#sk = :top',
      ExpressionAttributeNames: {
        '#sk': 'sort_key'
      },
      ExpressionAttributeValues: {
        ':top': 'TOP~'
      }
    };

    const queryResult = await searchDbItems(params);

    if (!Array.isArray(queryResult) || queryResult.length === 0) return null;

    queryResult.forEach(series => {
      series.seriesId = series.primary_key,
      delete series.primary_key,
      delete series.sort_key
    })

    return queryResult;

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}