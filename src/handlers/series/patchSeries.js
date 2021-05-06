import commonMiddleware from '../../lib/commonMiddleware';
import dbUpdateSeries from '../../db/dbUpdateSeries';

async function patchSeries(event) {
  const { contentId } = event.pathParameters;
  const seriesData = event.body;

  const updatedSeries = await dbUpdateSeries(contentId, seriesData);

  if(!updatedSeries) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `series:${contentId} not found` }),
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'item successfully updated', updatedSeries }),
  };
}

export const handler = commonMiddleware(patchSeries);
