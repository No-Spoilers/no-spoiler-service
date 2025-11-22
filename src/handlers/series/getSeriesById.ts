import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { internalServerError, extractStringValue } from '../../lib/utils.js';
import { searchDbItems } from '../../lib/dynamodb-client.js';

interface PathParameters {
  contentId: string;
  [key: string]: string;
}

interface GetSeriesByIdEvent extends AuthLambdaEvent {
  pathParameters: PathParameters;
}

async function getSeriesById(event: GetSeriesByIdEvent) {
  const { contentId } = event.pathParameters;

  const series = await dbQuerySeriesById(contentId);

  if (!series) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `Series for ID "${contentId}" not found.`,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(series),
  };
}

export const handler = commonMiddleware(getSeriesById);

interface SeriesItem {
  seriesId: string;
  name?: string;
  text?: string;
  bookId?: string;
  entryId?: string;
  [key: string]: unknown;
}

function searchByPrimaryKey(contentId: string) {
  return searchDbItems({
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: { '#pk': 'primary_key' },
    ExpressionAttributeValues: { ':pk': { S: contentId } },
  });
}

function searchBySecondaryKey(contentId: string) {
  return searchDbItems({
    IndexName: 'ReverseLookup',
    KeyConditionExpression: '#sk = :sk',
    ExpressionAttributeNames: { '#sk': 'sort_key' },
    ExpressionAttributeValues: { ':sk': { S: contentId } },
  });
}

async function dbQuerySeriesById(
  contentId: string,
): Promise<SeriesItem[] | null> {
  try {
    const reverseLookup = contentId.startsWith('s') ? false : true;

    const dbSearch = reverseLookup
      ? searchBySecondaryKey(contentId)
      : searchByPrimaryKey(contentId);

    const queryResult = await dbSearch;

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
    throw internalServerError(error);
  }
}
