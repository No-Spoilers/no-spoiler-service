import commonMiddleware from '../../lib/commonMiddleware';
import dbQuerySeriesById from '../../db/dbQuerySeriesById';

async function getSeriesById(event) {
  const { contentId } = event.pathParameters;

  const series = await dbQuerySeriesById(contentId);

  if (!series) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Series for ID "${contentId}" not found.` }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(series),
  };
}

export const handler = commonMiddleware(getSeriesById);
