import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { extractStringValue } from '../../lib/utils.js';
import { deleteDbItem } from '../../lib/dynamodb-client.js';

interface PathParameters {
  bookId: string;
  seriesId: string;
  [key: string]: string;
}

interface DeleteBookEvent extends AuthLambdaEvent {
  pathParameters: PathParameters;
}

interface DeletedBookResponse {
  seriesId: string;
  bookId: string;
  [key: string]: unknown;
}

async function deleteBook(event: DeleteBookEvent) {
  const { bookId, seriesId } = event.pathParameters;

  const result = await deleteDbItem(seriesId, bookId);

  const removedBook = result.Attributes;

  if (!removedBook) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `"${bookId}" from "${seriesId}" not found.`,
      }),
    };
  }

  const responseBook: DeletedBookResponse = {
    seriesId: extractStringValue(removedBook.primary_key),
    bookId: extractStringValue(removedBook.sort_key),
  };

  // Copy other properties
  Object.entries(removedBook).forEach(([key, value]) => {
    if (key !== 'primary_key' && key !== 'sort_key') {
      responseBook[key] = value;
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'item successfully deleted',
      deletedBook: responseBook,
    }),
  };
}

export const handler = commonMiddleware(deleteBook);
