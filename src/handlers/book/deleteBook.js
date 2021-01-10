import commonMiddleware from '../../lib/commonMiddleware';
import dbDeleteItem from '../../lib/dbDeleteItem';

async function deleteBook(event) {
  const { bookId, seriesId } = event.pathParameters;

  const removedBook = await dbDeleteItem(seriesId, bookId);

  if (!removedBook) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `"${bookId}" from "${seriesId}" not found.` }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'item successfully deleted', deletedBook: removedBook }),
  };
}

export const handler = commonMiddleware(deleteBook);
