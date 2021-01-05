import commonMiddleware from '../../lib/commonMiddleware';
import dbDeleteBook from '../../lib/dbDeleteBook';

async function deleteBook(event) {
  const { bookId } = event.pathParameters;
  console.log('bookId:', bookId);
  const removedBook = await dbDeleteBook(bookId);

  if (!removedBook) {
    console.log('fail path');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Book with ID "${bookId}" not found.` }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'item successfully deleted', deletedBook: removedBook }),
  };
}

export const handler = commonMiddleware(deleteBook);
