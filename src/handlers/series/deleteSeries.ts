import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { extractStringValue } from '../../lib/utils.js';
import { deleteDbItem } from '../../lib/dynamodb-client.js';

interface PathParameters {
  contentId: string;
  [key: string]: string;
}

interface DeleteSeriesEvent extends AuthLambdaEvent {
  pathParameters: PathParameters;
}

interface DeletedSeriesResponse {
  seriesId: string;
  [key: string]: unknown;
}

async function deleteSeries(event: DeleteSeriesEvent) {
  const { contentId } = event.pathParameters;

  const result = await deleteDbItem(contentId, 'TOP~');

  const deletedSeries = result.Attributes;

  if (!deletedSeries) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `Series with ID "${contentId}" not found.`,
      }),
    };
  }

  const responseSeries: DeletedSeriesResponse = {
    seriesId: extractStringValue(deletedSeries.primary_key),
  };

  // Copy other properties
  Object.entries(deletedSeries).forEach(([key, value]) => {
    if (key !== 'primary_key' && key !== 'sort_key') {
      responseSeries[key] = value;
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'item successfully deleted',
      deletedSeries: responseSeries,
    }),
  };
}

export const handler = commonMiddleware(deleteSeries);
