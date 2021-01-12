import commonMiddleware from '../../lib/commonMiddleware';
import dbQuerySeriesById from '../../db/dbQuerySeriesById';

async function getSeriesById(event) {
  const { seriesId } = event.pathParameters;

  const series = await dbQuerySeriesById(seriesId);

  if (!series) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Series with ID "${seriesId}" not found.` }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ series }),
  };
}

export const handler = commonMiddleware(getSeriesById);
