import type {
  QueryCommandInput,
  ComparisonOperator,
} from '@aws-sdk/client-dynamodb';

import { internalServerError, extractStringValue } from '../lib/utils.js';
import { searchDbItems } from '../lib/dynamodb-client.js';

interface UserRecord {
  userId: string;
  name: string;
  preservedCaseEmail: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export async function dbQueryUserByEmail(
  email: string,
): Promise<UserRecord | null> {
  try {
    const normalizedEmail = email.toLowerCase();

    const params: Partial<QueryCommandInput> = {
      KeyConditions: {
        primary_key: {
          AttributeValueList: [{ S: 'user' }],
          ComparisonOperator: 'EQ' as ComparisonOperator,
        },
        sort_key: {
          AttributeValueList: [{ S: normalizedEmail }],
          ComparisonOperator: 'EQ' as ComparisonOperator,
        },
      },
    };

    const queryResult = await searchDbItems(params);

    if (queryResult instanceof Error) {
      throw queryResult;
    }

    if (!Array.isArray(queryResult) || queryResult.length === 0) return null;

    // Convert DynamoDB AttributeValue to plain object
    const userRecord = queryResult[0];
    if (!userRecord) return null;

    const user: UserRecord = {
      userId: extractStringValue(userRecord.userId),
      name: extractStringValue(userRecord.name),
      preservedCaseEmail: extractStringValue(userRecord.preservedCaseEmail),
      passwordHash: extractStringValue(userRecord.passwordHash),
      createdAt: extractStringValue(userRecord.createdAt),
      updatedAt: extractStringValue(userRecord.updatedAt),
    };

    return user;
  } catch (error) {
    throw internalServerError(error);
  }
}
