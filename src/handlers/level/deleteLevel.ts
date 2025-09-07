import commonMiddleware, {
  HandlerEvent,
  HandlerResponse,
} from '../../lib/commonMiddleware.js';
import dbDeleteItem from '../../db/dbDeleteItem.js';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

interface PathParameters {
  seriesId: string;
  [key: string]: string;
}

interface DeleteLevelEvent extends HandlerEvent {
  pathParameters: PathParameters;
  token?: {
    sub: string;
    userId: string;
    email: string;
    [key: string]: unknown;
  };
}

interface DeletedLevelResponse {
  userId: string;
  seriesId: string;
  [key: string]: unknown;
}

async function deleteLevel(event: DeleteLevelEvent): Promise<HandlerResponse> {
  const { seriesId } = event.pathParameters;
  const { token } = event;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }

  const { sub: userId } = token;

  const deletedLevel = await dbDeleteItem(userId, seriesId);

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
