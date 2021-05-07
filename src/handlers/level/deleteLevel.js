import commonMiddleware from '../../lib/commonMiddleware';
import dbDeleteItem from '../../db/dbDeleteItem';

async function deleteLevel(event) {
  const { seriesId } = event.pathParameters;
  const { sub: userId } = event.token;

  const deletedLevel = await dbDeleteItem(userId, seriesId);

  if (!deletedLevel) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Series or User not found.' }),
    };
  }

  deletedLevel.userId = deletedLevel.primary_key,
  deletedLevel.seriesId = deletedLevel.sort_key,
  delete deletedLevel.primary_key,
  delete deletedLevel.sort_key

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'item successfully deleted', deletedLevel }),
  };
}

export const handler = commonMiddleware(deleteLevel);
