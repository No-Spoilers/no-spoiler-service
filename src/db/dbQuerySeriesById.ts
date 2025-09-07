import createError from 'http-errors';
import { searchDbItems } from '../lib/dynamodb-client.js';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

interface SeriesItem {
  seriesId: string;
  name?: string;
  text?: string;
  bookId?: string;
  entryId?: string;
  [key: string]: unknown;
}

interface SeriesRecord {
  primary_key: string;
  sort_key: string;
  name?: string;
  text?: string;
  [key: string]: unknown;
}

export default async function dbQuerySeriesById(
  contentId: string,
): Promise<SeriesItem[] | null> {
  try {
    const reverseLookup = contentId.startsWith('s') ? false : true;

    const params = reverseLookup
      ? {
          IndexName: 'ReverseLookup',
          KeyConditionExpression: '#sk = :sk',
          ExpressionAttributeNames: { '#sk': 'sort_key' },
          ExpressionAttributeValues: { ':sk': { S: contentId } },
        }
      : {
          KeyConditionExpression: '#pk = :pk',
          ExpressionAttributeNames: { '#pk': 'primary_key' },
          ExpressionAttributeValues: { ':pk': { S: contentId } },
        };

    const queryResult = await searchDbItems(params);

    if (queryResult instanceof Error) {
      throw queryResult;
    }

    if (!Array.isArray(queryResult) || queryResult.length === 0) return null;

    if (reverseLookup) {
      // always return full series info, even if query was for a book or entry
      const firstResult = queryResult[0];
      if (firstResult && firstResult.primary_key) {
        const seriesId = extractStringValue(firstResult.primary_key);
        if (seriesId) {
          return dbQuerySeriesById(seriesId);
        }
      }
      return null;
    }

    const seriesItems: SeriesItem[] = queryResult.map((item) => {
      const seriesItem: SeriesItem = {
        seriesId: extractStringValue(item.primary_key),
      };

      const sortKey = extractStringValue(item.sort_key);
      switch (sortKey.charAt(0)) {
        case 'T':
          // Series item
          seriesItem.name = extractStringValue(item.name);
          seriesItem.text = extractStringValue(item.text);
          break;

        case 'b':
          // Book item
          seriesItem.bookId = sortKey;
          seriesItem.name = extractStringValue(item.name);
          seriesItem.text = extractStringValue(item.text);
          break;

        case 'e':
          // Entry item
          seriesItem.entryId = sortKey;
          seriesItem.name = extractStringValue(item.name);
          seriesItem.text = extractStringValue(item.text);
          break;

        default:
          break;
      }

      return seriesItem;
    });

    return seriesItems;
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
