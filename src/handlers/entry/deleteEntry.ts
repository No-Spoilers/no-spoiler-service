import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { extractStringValue } from '../../lib/utils.js';
import { deleteDbItem } from '../../lib/dynamodb-client.js';

interface PathParameters {
  seriesId: string;
  entryId: string;
  [key: string]: string;
}

interface DeleteEntryEvent extends AuthLambdaEvent {
  pathParameters: PathParameters;
}

interface DeletedEntryResponse {
  seriesId: string;
  entryId: string;
  [key: string]: unknown;
}

async function deleteEntry(event: DeleteEntryEvent) {
  const { seriesId, entryId } = event.pathParameters;

  const result = await deleteDbItem(seriesId, entryId);

  const removedEntry = result.Attributes;

  if (!removedEntry) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `"${entryId}" from "${seriesId}" not found.`,
      }),
    };
  }

  const responseEntry: DeletedEntryResponse = {
    seriesId: extractStringValue(removedEntry.primary_key),
    entryId: extractStringValue(removedEntry.sort_key),
  };

  // Copy other properties
  Object.entries(removedEntry).forEach(([key, value]) => {
    if (key !== 'primary_key' && key !== 'sort_key') {
      responseEntry[key] = value;
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'item successfully deleted',
      deletedEntry: responseEntry,
    }),
  };
}

export const handler = commonMiddleware(deleteEntry);
