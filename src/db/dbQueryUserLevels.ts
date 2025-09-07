import type { AttributeValue } from '@aws-sdk/client-dynamodb';

import createError from 'http-errors';
import { searchDbItems } from '../lib/dynamodb-client.js';

interface LevelsBySeries {
  [seriesId: string]: string;
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
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
}

function extractStringValue(attrValue: AttributeValue | undefined): string {
  if (attrValue && 'S' in attrValue) {
    return attrValue.S || '';
  }
  return '';
}
