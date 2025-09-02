import createError from 'http-errors';
import { searchDbItems } from '../lib/dynamodb-client.js';
import { AttributeValue, QueryCommandInput } from '@aws-sdk/client-dynamodb';

interface SeriesRecord {
  seriesId: string;
  name: string;
  text: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export default async function dbQuerySeries(): Promise<SeriesRecord[] | Error> {
  try {
    const params: Partial<QueryCommandInput> = {
      IndexName: 'ReverseLookup',
      KeyConditionExpression: '#sk = :top',
      ExpressionAttributeNames: {
        '#sk': 'sort_key'
      },
      ExpressionAttributeValues: {
        ':top': { S: 'TOP~' }
      }
    };

    const queryResult = await searchDbItems(params);

    if (queryResult instanceof Error) {
      return queryResult;
    }

    if (Array.isArray(queryResult)) {
      const seriesList: SeriesRecord[] = queryResult.map(series => {
        const seriesRecord: SeriesRecord = {
          seriesId: extractStringValue(series.primary_key),
          name: extractStringValue(series.name),
          text: extractStringValue(series.text),
          createdBy: extractStringValue(series.createdBy),
          createdAt: extractStringValue(series.createdAt),
          updatedAt: extractStringValue(series.updatedAt)
        };
        return seriesRecord;
      });
      return seriesList;
    }

    return [];

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
