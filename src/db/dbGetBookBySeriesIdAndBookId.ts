import { internalServerError, extractStringValue } from '../lib/utils.js';
import { getDbItem } from '../lib/dynamodb-client.js';

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

export async function dbGetBookBySeriesIdAndBookId(
  seriesId: string,
  bookId: string,
): Promise<BookRecord | null> {
  try {
    const book = await getDbItem({ S: seriesId }, { S: bookId });

    if (!book) return null;

    const bookRecord: BookRecord = {
      seriesId: extractStringValue(book.primary_key),
      bookId: extractStringValue(book.sort_key),
      name: extractStringValue(book.name),
      text: extractStringValue(book.text),
      pubDate: extractStringValue(book.pubDate),
      createdBy: extractStringValue(book.createdBy),
      createdAt: extractStringValue(book.createdAt),
      updatedAt: extractStringValue(book.updatedAt),
    };

    return bookRecord;
  } catch (error) {
    throw internalServerError(error);
  }
}
