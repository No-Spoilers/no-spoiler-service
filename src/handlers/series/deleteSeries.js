import commonMiddleware from '../../lib/commonMiddleware';
import dbDeleteItem from '../../db/dbDeleteItem';

async function deleteSeries(event) {
  const { seriesId } = event.pathParameters;

  const removedSeries = await dbDeleteItem('TOP~', seriesId);

  if (!removedSeries) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Series with ID "${seriesId}" not found.` }),
    };
  }

  removedSeries.seriesId = removedSeries.sort_key,
  delete removedSeries.primary_key,
  delete removedSeries.sort_key

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'item successfully deleted', deletedSeries: removedSeries }),
  };
}

export const handler = commonMiddleware(deleteSeries);
