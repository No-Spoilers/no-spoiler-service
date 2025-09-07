import generateId from '../lib/base64id.js';
import { putDbItem } from '../lib/dynamodb-client.js';

interface BookData {
  pubDate: string;
  seriesId: string;
  name: string;
  text: string;
}

interface TokenData {
  sub: string;
  [key: string]: unknown;
}

interface BookRecord {
  primary_key: string;
  sort_key: string;
  name: string;
  text: string;
  pubDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface BookResponse {
  seriesId: string;
  bookId: string;
  name: string;
  text: string;
  pubDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default async function dbCreateBook(
  bookData: BookData,
  token: TokenData,
): Promise<BookResponse> {
  const now = new Date().toISOString();
  const formattedDate = new Date(bookData.pubDate).toISOString();

  const book: BookRecord = {
    primary_key: bookData.seriesId,
    sort_key: `b${generateId(10)}`,
    name: bookData.name,
    text: bookData.text,
    pubDate: formattedDate,
    createdBy: token.sub,
    createdAt: now,
    updatedAt: now,
  };

  await putDbItem(book);

  const bookResponse: BookResponse = {
    seriesId: book.primary_key,
    bookId: book.sort_key,
    name: book.name,
    text: book.text,
    pubDate: book.pubDate,
    createdBy: book.createdBy,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  };

  return bookResponse;
}
