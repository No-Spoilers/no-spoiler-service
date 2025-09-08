import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { dbUpdateSeries } from '../../db/dbUpdateSeries.js';

interface PathParameters {
  contentId: string;
  [key: string]: string;
}

interface SeriesUpdateData {
  name?: string;
  text?: string;
  [key: string]: unknown;
}

interface PatchSeriesEvent extends AuthLambdaEvent {
  pathParameters: PathParameters;
  body: SeriesUpdateData;
}

async function patchSeries(event: PatchSeriesEvent) {
  const { contentId } = event.pathParameters;
  const seriesData = event.body;

  const updatedSeries = await dbUpdateSeries(contentId, seriesData);

  if (!updatedSeries) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `series:${contentId} not found` }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'item successfully updated',
      updatedSeries,
    }),
  };
}

export const handler = commonMiddleware(patchSeries);
