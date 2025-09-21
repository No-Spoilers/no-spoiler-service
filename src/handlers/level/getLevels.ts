import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import { extractStringValue, internalServerError } from '../../lib/utils.js';
import { searchDbItems } from '../../lib/dynamodb-client.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';

interface LevelsBySeries {
  [seriesId: string]: string;
}

export const handler = commonMiddleware(getLevels);

async function getLevels(event: AuthLambdaEvent) {
  try {
    const { token } = event;

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'invalid token' }),
      };
    }

    const seriesList = await dbQueryUserLevels(token.sub);

    return {
      statusCode: 200,
      body: JSON.stringify(seriesList),
    };
  } catch (error) {
    console.error(error);
    throw internalServerError(error);
  }
}

export async function dbQueryUserLevels(
  userId: string,
): Promise<LevelsBySeries> {
  try {
    const params = {
      KeyConditionExpression: 'primary_key = :primary_key',
      ExpressionAttributeValues: {
        ':primary_key': { S: userId },
      },
    };

    const queryResult = await searchDbItems(params);

    if (queryResult instanceof Error) {
      throw queryResult;
    }

    const levelsBySeries: LevelsBySeries = queryResult.reduce(
      (acc: LevelsBySeries, entry) => {
        const seriesId = extractStringValue(entry.sort_key);
        const level = extractStringValue(entry.level);
        if (seriesId && level) {
          acc[seriesId] = level;
        }
        return acc;
      },
      {},
    );

    return levelsBySeries;
  } catch (error) {
    throw internalServerError(error);
  }
}
