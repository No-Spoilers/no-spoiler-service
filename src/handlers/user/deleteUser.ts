import commonMiddleware, { HandlerEvent, HandlerContext, HandlerResponse } from '../../lib/commonMiddleware.js';
import dbDeleteItem from '../../db/dbDeleteItem.js';
import dbQueryUserByEmail from '../../db/dbQueryUserByEmail.js';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

interface DeleteUserBody {
  email: string;
  [key: string]: unknown;
}

interface DeleteUserEvent extends HandlerEvent {
  body: DeleteUserBody;
  token?: {
    sub: string;
    userId: string;
    email: string;
    [key: string]: unknown;
  };
}

interface DeletedUserResponse {
  name: string;
  email: string;
}

async function deleteUser(event: DeleteUserEvent, _context: HandlerContext): Promise<HandlerResponse> {
  const { token } = event;
  let { email } = event.body;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }

  email = email.toLowerCase();

  const user = await dbQueryUserByEmail(email);

  if (!user) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `user:${email} not found.` }),
    };
  }

  if (user.userId !== token.sub) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'unauthorized' }),
    };
  }

  const result = await dbDeleteItem('user', email);

  if (!result) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `user:${email} not found.` }),
    };
  }

  const deletedUser: DeletedUserResponse = {
    name: extractStringValue(result.name),
    email: extractStringValue(result.preservedCaseEmail)
  };

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'user successfully deleted', deletedUser }),
  };
}

function extractStringValue(attrValue: AttributeValue | undefined): string {
  if (attrValue && 'S' in attrValue) {
    return attrValue.S || '';
  }
  return '';
}

export const handler = commonMiddleware(deleteUser);
