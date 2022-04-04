import commonMiddleware from '../../lib/commonMiddleware.js';
import dbDeleteItem from '../../db/dbDeleteItem.js';

async function deleteBook(event) {
  const { bookId, seriesId } = event.pathParameters;

  const removedBook = await dbDeleteItem(seriesId, bookId);

  if (!removedBook) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `"${bookId}" from "${seriesId}" not found.` }),
    };
  }

  removedBook.seriesId = removedBook.primary_key,
  removedBook.bookId = removedBook.sort_key,
  delete removedBook.primary_key,
  delete removedBook.sort_key

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'item successfully deleted', deletedBook: removedBook }),
  };
}

export const handler = commonMiddleware(deleteBook);
