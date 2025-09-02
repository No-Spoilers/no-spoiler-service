import createError from 'http-errors';
import { getDbItem } from '../lib/dynamodb-client.js';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

interface BookRecord {
  seriesId: string;
  bookId: string;
  name?: string;
  text?: string;
  pubDate?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export default async function dbGetBookBySeriesIdAndBookId(seriesId: string, bookId: string): Promise<BookRecord | null> {
  try {
    const book = await getDbItem(
      { S: seriesId },
      { S: bookId }
    );

    if (!book) return null;

    const bookRecord: BookRecord = {
      seriesId: extractStringValue(book.primary_key),
      bookId: extractStringValue(book.sort_key),
      name: extractStringValue(book.name),
      text: extractStringValue(book.text),
      pubDate: extractStringValue(book.pubDate),
      createdBy: extractStringValue(book.createdBy),
      createdAt: extractStringValue(book.createdAt),
      updatedAt: extractStringValue(book.updatedAt)
    };

    return bookRecord;

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
