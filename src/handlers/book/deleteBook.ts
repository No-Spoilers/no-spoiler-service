import commonMiddleware, { HandlerEvent, HandlerResponse } from '../../lib/commonMiddleware.js';
import dbDeleteItem from '../../db/dbDeleteItem.js';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

interface PathParameters {
  bookId: string;
  seriesId: string;
  [key: string]: string;
}

interface DeleteBookEvent extends HandlerEvent {
  pathParameters: PathParameters;
}

interface DeletedBookResponse {
  seriesId: string;
  bookId: string;
  [key: string]: unknown;
}

async function deleteBook(event: DeleteBookEvent): Promise<HandlerResponse> {
  const { bookId, seriesId } = event.pathParameters;

  const removedBook = await dbDeleteItem(seriesId, bookId);

  if (!removedBook) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `"${bookId}" from "${seriesId}" not found.` }),
    };
  }

  const responseBook: DeletedBookResponse = {
    seriesId: extractStringValue(removedBook.primary_key),
    bookId: extractStringValue(removedBook.sort_key)
  };

  // Copy other properties
  Object.entries(removedBook).forEach(([key, value]) => {
    if (key !== 'primary_key' && key !== 'sort_key') {
      responseBook[key] = value;
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'item successfully deleted', deletedBook: responseBook }),
  };
}

function extractStringValue(attrValue: AttributeValue | undefined): string {
  if (attrValue && 'S' in attrValue) {
    return attrValue.S || '';
  }
  return '';
}

export const handler = commonMiddleware(deleteBook);
