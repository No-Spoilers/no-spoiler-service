import type { QueryCommandInput } from '@aws-sdk/client-dynamodb';

import { internalServerError, extractStringValue } from '../../lib/utils.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { searchDbItems } from '../../lib/dynamodb-client.js';

interface SeriesRecord {
  seriesId: string;
  name: string;
  text: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

async function getSeries() {
  try {
    const params: Partial<QueryCommandInput> = {
      IndexName: 'ReverseLookup',
      KeyConditionExpression: '#sk = :top',
      ExpressionAttributeNames: {
        '#sk': 'sort_key',
      },
      ExpressionAttributeValues: {
        ':top': { S: 'TOP~' },
      },
    };

    const queryResult = await searchDbItems(params);

    if (queryResult instanceof Error) {
      throw queryResult;
    }

    if (!Array.isArray(queryResult)) {
      return [];
    }

    const seriesList: SeriesRecord[] = queryResult.map((series) => ({
      seriesId: extractStringValue(series.primary_key),
      name: extractStringValue(series.name),
      text: extractStringValue(series.text),
      createdBy: extractStringValue(series.createdBy),
      createdAt: extractStringValue(series.createdAt),
      updatedAt: extractStringValue(series.updatedAt),
    }));

    return {
      statusCode: 200,
      body: seriesList,
    };
  } catch (error) {
    throw internalServerError(error);
  }
}

export const handler = commonMiddleware(getSeries);
