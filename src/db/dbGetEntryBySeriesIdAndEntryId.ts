import type { AttributeValue } from '@aws-sdk/client-dynamodb';

import { internalServerError, extractStringValue } from '../lib/utils.js';
import { getDbItem } from '../lib/dynamodb-client.js';

interface EntryRecord {
  seriesId: string;
  entryId: string;
  name?: string;
  text?: { [key: string]: string };
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export async function dbGetEntryBySeriesIdAndEntryId(
  seriesId: string,
  entryId: string,
): Promise<EntryRecord | null> {
  try {
    const entry = await getDbItem({ S: seriesId }, { S: entryId });

    if (!entry) return null;

    const entryRecord: EntryRecord = {
      seriesId: extractStringValue(entry.primary_key),
      entryId: extractStringValue(entry.sort_key),
      name: extractStringValue(entry.name),
      text: extractTextValue(entry.text),
      createdBy: extractStringValue(entry.createdBy),
      createdAt: extractStringValue(entry.createdAt),
      updatedAt: extractStringValue(entry.updatedAt),
    };

    return entryRecord;
  } catch (error) {
    throw internalServerError(error);
  }
}

function extractTextValue(attrValue: AttributeValue | undefined): {
  [key: string]: string;
} {
  if (attrValue && 'M' in attrValue && attrValue.M) {
    const text: { [key: string]: string } = {};
    Object.entries(attrValue.M).forEach(([key, value]) => {
      if (value && 'S' in value) {
        text[key] = value.S || '';
      }
    });
    return text;
  }
  return {};
}
