import createError from 'http-errors';
import { searchDbItems } from '../lib/dynamodb-client';

export default async function dbQuerySeriesById(contentId) {
  try {
    const reverseLookup = contentId.startsWith('s') ? false : true;

    const params = reverseLookup ? {
      IndexName: 'ReverseLookup',
      KeyConditionExpression: '#sk = :sk',
      ExpressionAttributeNames: { '#sk': 'sort_key' },
      ExpressionAttributeValues: { ':sk': contentId }
    } : {
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: { '#pk': 'primary_key' },
      ExpressionAttributeValues: { ':pk': contentId }
    };

    const queryResult = await searchDbItems(params);

    if (!Array.isArray(queryResult) || queryResult.length === 0) return null;

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