import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { dbQuerySeriesById } from '../../db/dbQuerySeriesById.js';

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
