import commonMiddleware from '../../lib/commonMiddleware.js';
import dbDeleteItem from '../../db/dbDeleteItem.js';

async function deleteEntry(event) {
  const { seriesId, entryId } = event.pathParameters;

  const removedEntry = await dbDeleteItem(seriesId, entryId);

  if (!removedEntry) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `"${entryId}" from "${seriesId}" not found.` }),
    };
  }

  removedEntry.seriesId = removedEntry.primary_key,
  removedEntry.entryId = removedEntry.sort_key,
  delete removedEntry.primary_key,
  delete removedEntry.sort_key


  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'item successfully deleted', deletedEntry: removedEntry }),
  };
}

export const handler = commonMiddleware(deleteEntry);
