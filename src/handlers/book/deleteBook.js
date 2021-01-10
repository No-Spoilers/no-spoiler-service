import commonMiddleware from '../../lib/commonMiddleware';
import dbDeleteBook from '../../lib/dbDeleteBook';

async function deleteBook(event) {
  const { bookId, seriesId } = event.pathParameters;

  const removedBook = await dbDeleteBook(bookId, seriesId);

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
