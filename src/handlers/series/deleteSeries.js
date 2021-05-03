import commonMiddleware from '../../lib/commonMiddleware';
import dbDeleteItem from '../../db/dbDeleteItem';

async function deleteSeries(event) {
  const { contentId } = event.pathParameters;

  const deletedSeries = await dbDeleteItem(contentId, 'TOP~');

  if (!deletedSeries) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Series with ID "${contentId}" not found.` }),
    };
  }

  deletedSeries.seriesId = deletedSeries.primary_key,
  delete deletedSeries.primary_key,
  delete deletedSeries.sort_key

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'item successfully deleted', deletedSeries }),
  };
}

export const handler = commonMiddleware(deleteSeries);
