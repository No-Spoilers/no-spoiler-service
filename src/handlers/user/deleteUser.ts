import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { extractStringValue } from '../../lib/utils.js';
import { deleteDbItem } from '../../lib/dynamodb-client.js';
import { dbQueryUserByEmail } from '../../db/dbQueryUserByEmail.js';

interface DeleteUserBody {
  email: string;
  [key: string]: unknown;
}

interface DeleteUserEvent extends AuthLambdaEvent {
  body: DeleteUserBody;
}

interface DeletedUserResponse {
  name: string;
  email: string;
}

async function deleteUser(event: DeleteUserEvent) {
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

  const result = await deleteDbItem('user', email);

  const deletedUser = result.Attributes;

  if (!deletedUser) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `user:${email} not found.` }),
    };
  }

  const responseUser: DeletedUserResponse = {
    name: extractStringValue(deletedUser.name),
    email: extractStringValue(deletedUser.preservedCaseEmail),
  };

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'user successfully deleted',
      responseUser,
    }),
  };
}

export const handler = commonMiddleware(deleteUser);
