import generateId from '../lib/base64id.js';
import { putDbItem } from '../lib/dynamodb-client.js';


export default async function dbCreateBook({ pubDate, seriesId, name, text }, token) {
  const now = new Date().toISOString();
  const formattedDate = new Date(pubDate).toISOString();

  const book = {
    primary_key: seriesId,
    sort_key: `b${generateId(10)}`,
    name,
    text,
    pubDate: formattedDate,
    createdBy: token.sub,
    createdAt: now,
    updatedAt: now
  };

  await putDbItem(book);

  book.seriesId = book.primary_key;
  book.bookId = book.sort_key;
  delete book.primary_key;
  delete book.sort_key;

  return book;
}