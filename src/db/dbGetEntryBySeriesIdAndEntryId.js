import createError from 'http-errors';
import { getDbItem } from '../lib/dynamodb-client';

export default async function dbGetEntryBySeriesIdAndEntryId(seriesId, entryId) {
  try {
    const entry = await getDbItem(seriesId, entryId);

    if (!entry) return null;

    entry.seriesId = entry.primary_key,
    entry.entryId = entry.sort_key,
    delete entry.primary_key,
    delete entry.sort_key

    return entry;

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}