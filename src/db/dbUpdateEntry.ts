import type { AttributeValue } from '@aws-sdk/client-dynamodb';

import createError from 'http-errors';
import { updateDbItem } from '../lib/dynamodb-client.js';

interface EntryText {
  [bookId: string]: string;
}

interface EntryData {
  seriesId: string;
  entryId: string;
  text: EntryText;
  [key: string]: unknown;
}

interface NewEntryData {
  bookId: string;
  text: string;
  [key: string]: unknown;
}

interface EntryUpdateRecord {
  seriesId: string;
  entryId: string;
  text?: EntryText;
  [key: string]: unknown;
}

interface EntryResponse {
  seriesId: string;
  entryId: string;
  text: EntryText;
  updatedAt: string;
  updatedBy: string;
}

export async function dbUpdateEntry(
  entry: EntryData | EntryUpdateRecord,
  newEntry: NewEntryData,
  userId: string,
): Promise<EntryResponse> {
  try {
    const now = new Date();

    // Both types have the same structure now
    const seriesId = entry.seriesId;
    const entryId = entry.entryId;
    const entryText = entry.text || {};

    const newText: EntryText = {
      ...entryText,
      [`${newEntry.bookId}`]: newEntry.text,
    };

    const params = {
      TableName: process.env.NO_SPOILERS_TABLE_NAME || 'NoSpoilersTable-dev',
      Key: {
        primary_key: { S: seriesId },
        sort_key: { S: entryId },
      },
      UpdateExpression:
        'set updatedAt=:updatedAt, updatedBy=:updatedBy, #text=:text',
      ExpressionAttributeNames: {
        '#text': 'text',
      },
      ExpressionAttributeValues: {
        ':updatedAt': { S: now.toISOString() },
        ':updatedBy': { S: userId },
        ':text': { M: convertToAttributeValue(newText) },
      },
    };

    const updatedEntry = await updateDbItem(params);

    if (!updatedEntry) {
      throw new Error('Failed to update entry');
    }

    const entryResponse: EntryResponse = {
      seriesId: extractStringValue(updatedEntry.primary_key),
      entryId: extractStringValue(updatedEntry.sort_key),
      text: extractTextValue(updatedEntry.text),
      updatedAt: extractStringValue(updatedEntry.updatedAt),
      updatedBy: extractStringValue(updatedEntry.updatedBy),
    };

    return entryResponse;
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

function extractTextValue(attrValue: AttributeValue | undefined): EntryText {
  if (attrValue && 'M' in attrValue && attrValue.M) {
    const text: EntryText = {};
    Object.entries(attrValue.M).forEach(([key, value]) => {
      if (value && 'S' in value) {
        text[key] = value.S || '';
      }
    });
    return text;
  }
  return {};
}

function convertToAttributeValue(
  text: EntryText,
): Record<string, AttributeValue> {
  const result: Record<string, AttributeValue> = {};
  Object.entries(text).forEach(([key, value]) => {
    result[key] = { S: value };
  });
  return result;
}
