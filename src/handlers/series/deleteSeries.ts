import commonMiddleware from '../../lib/commonMiddleware.js';
import dbDeleteItem from '../../db/dbDeleteItem.js';

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
