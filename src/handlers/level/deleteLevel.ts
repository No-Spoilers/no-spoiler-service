import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';
import type { AttributeValue } from '@aws-sdk/client-dynamodb';

import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { deleteDbItem } from '../../lib/dynamodb-client.js';

interface PathParameters {
  seriesId: string;
  [key: string]: string;
}

interface DeleteLevelEvent extends AuthLambdaEvent {
  pathParameters: PathParameters;
}

interface DeletedLevelResponse {
  userId: string;
  seriesId: string;
  [key: string]: unknown;
}

async function deleteLevel(event: DeleteLevelEvent) {
  const { seriesId } = event.pathParameters;
  const { token } = event;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }

  const { sub: userId } = token;

  const result = await deleteDbItem(userId, seriesId);

  const deletedLevel = result.Attributes;

  if (!deletedLevel) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Series or User not found.' }),
    };
  }

  const responseLevel: DeletedLevelResponse = {
    userId: extractStringValue(deletedLevel.primary_key),
    seriesId: extractStringValue(deletedLevel.sort_key),
  };

  // Copy other properties
  Object.entries(deletedLevel).forEach(([key, value]) => {
    if (key !== 'primary_key' && key !== 'sort_key') {
      responseLevel[key] = value;
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'item successfully deleted',
      deletedLevel: responseLevel,
    }),
  };
}

function extractStringValue(attrValue: AttributeValue | undefined): string {
  if (attrValue && 'S' in attrValue) {
    return attrValue.S || '';
  }
  return '';
}

export const handler = commonMiddleware(deleteLevel);
