import commonMiddleware from '../../lib/commonMiddleware';
import dbDeleteSeries from '../../lib/dbDeleteSeries';

async function deleteSeries(event) {
  const { seriesId } = event.pathParameters;

  const removedSeries = await dbDeleteSeries(seriesId);

  if (!removedSeries) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Series with ID "${seriesId}" not found.` }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'item successfully deleted', deletedSeries: removedSeries }),
  };
}

export const handler = commonMiddleware(deleteSeries);
