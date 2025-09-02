import createError from 'http-errors';
import { searchDbItems } from '../lib/dynamodb-client.js';

export default async function dbQueryUserLevels(userId) {
  try {
    const params = {
      KeyConditionExpression: 'primary_key = :primary_key',
      ExpressionAttributeValues: {
        ':primary_key': userId
      }
    };

    const queryResult = await searchDbItems(params);

    const levelsBySeries = queryResult.reduce((acc, entry) => {
      acc[entry.sort_key] = entry.level;
      return acc;
    }, {});

    return levelsBySeries;

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}