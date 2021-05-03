import commonMiddleware from '../../lib/commonMiddleware';
import dbUpdateSeries from '../../db/dbUpdateSeries';

async function patchSeries(event) {
  const { contentId } = event.pathParameters;
  const { name } = event.body;

  const updatedSeries = await dbUpdateSeries(contentId, name);

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
