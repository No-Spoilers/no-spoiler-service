import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import { internalServerError, extractStringValue } from '../../lib/utils.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { getDbItem, updateDbItem } from '../../lib/dynamodb-client.js';

interface TokenData {
  sub: string;
  [key: string]: unknown;
}

interface BookResponse {
  seriesId: string;
  bookId: string;
  name?: string;
  text?: string;
  pubDate?: string;
  updatedAt: string;
  updatedBy: string;
}

interface PathParameters {
  seriesId: string;
  bookId: string;
  [key: string]: string;
}

interface BookUpdateData {
  name?: string;
  text?: string;
  pubDate?: string;
  seriesId: string;
  bookId: string;
  [key: string]: unknown;
}

interface PatchBookEvent extends AuthLambdaEvent {
  pathParameters: PathParameters;
  body: Partial<BookUpdateData>;
}

async function patchBook(event: PatchBookEvent) {
  const { token } = event;
  const { seriesId, bookId } = event.pathParameters;
  const foo = event.body;

  const bookData: BookUpdateData = {
    ...foo,
    seriesId,
    bookId,
  };

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }
  if (!seriesId || !bookId) {
    return {
      statusCode: 400,
      body: { error: 'Series and book IDs are required.' },
    };
  }

  try {
    const book = await getDbItem(seriesId, bookId);
    if (!book) {
      return {
        statusCode: 400,
        body: { error: `Book with ID "${seriesId}/${bookId}" not found.` },
      };
    }

    const newBook = await dbUpdateBook(bookData, token);

    return {
      statusCode: 200,
      body: JSON.stringify(newBook),
    };
  } catch (error) {
    throw internalServerError(error);
  }
}

export const handler = commonMiddleware(patchBook);

async function dbUpdateBook(
  bookData: BookUpdateData,
  token: TokenData,
): Promise<BookResponse> {
  try {
    const { seriesId, bookId } = bookData;
    const now = new Date();
    if (bookData.pubDate) {
      bookData.pubDate = new Date(bookData.pubDate).toISOString();
    }

    let updateExpression = 'set updatedAt = :updatedAt, updatedBy=:updatedBy';

    const expressionAttributeValues: Record<string, AttributeValue> = {
      ':updatedAt': { S: now.toISOString() },
      ':updatedBy': { S: token.sub },
    };

    const expressionAttributeNames: Record<string, string> = {};

    const validFields = ['name', 'text', 'pubDate'];

    validFields.forEach((field) => {
      if (bookData[field]) {
        updateExpression += `, #${field} = :${field}`;
        expressionAttributeNames[`#${field}`] = `${field}`;
        expressionAttributeValues[`:${field}`] = {
          S: bookData[field] as string,
        };
      }
    });

    const params = {
      TableName: process.env.NO_SPOILERS_TABLE_NAME || 'NoSpoilersTable-dev',
      Key: {
        primary_key: { S: seriesId },
        sort_key: { S: bookId },
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    const book = await updateDbItem(params);

    if (!book) {
      throw new Error('Failed to update book');
    }

    const bookResponse: BookResponse = {
      seriesId: extractStringValue(book.primary_key),
      bookId: extractStringValue(book.sort_key),
      name: extractStringValue(book.name),
      text: extractStringValue(book.text),
      pubDate: extractStringValue(book.pubDate),
      updatedAt: extractStringValue(book.updatedAt),
      updatedBy: extractStringValue(book.updatedBy),
    };

    return bookResponse;
  } catch (error) {
    throw internalServerError(error);
  }
}
