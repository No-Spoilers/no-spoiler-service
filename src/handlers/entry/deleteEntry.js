import commonMiddleware from '../../lib/commonMiddleware';
import dbDeleteItem from '../../lib/dbDeleteItem';

async function deleteEntry(event) {
  const { seriesId, entryId } = event.pathParameters;

  const removedEntry = await dbDeleteItem(seriesId, entryId);

  if (!removedEntry) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `"${entryId}" from "${seriesId}" not found.` }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'item successfully deleted', deleteEntry: removedEntry }),
  };
}

export const handler = commonMiddleware(deleteEntry);
