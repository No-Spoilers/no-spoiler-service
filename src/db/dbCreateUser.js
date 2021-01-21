import AWS from 'aws-sdk';
import generateId from '../lib/base64id';
import bcrypt from 'bcryptjs';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbCreateUser(name) {
  const now = new Date();

  const temporaryPassword = `${generateId(20)}`;
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);

  const user = {
    primary_key: 'user',
    sort_key: `u${generateId(10)}`,
    name,
    passwordHash,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }

  const params = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Item: user
  };

  await dynamodb.put(params).promise();

  user.temporaryPassword = temporaryPassword;

  return user;
}