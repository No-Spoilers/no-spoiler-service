import type { AttributeValue } from '@aws-sdk/client-dynamodb';

import createError from 'http-errors';
import { updateDbItem } from '../lib/dynamodb-client.js';

interface BookUpdateData {
  seriesId: string;
  bookId: string;
  name?: string;
  text?: string;
  pubDate?: string;
  [key: string]: unknown;
}

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

export async function dbUpdateBook(
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
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
}

function extractStringValue(attrValue: AttributeValue | undefined): string {
  if (attrValue && 'S' in attrValue) {
    return attrValue.S || '';
  }
  return '';
}
