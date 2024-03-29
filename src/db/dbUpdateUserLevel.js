import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbUpdateUserLevel(token, seriesId, bookId) {
  const userId = token.sub;
  const now = new Date();

  const params = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Key:{
      primary_key: userId,
      sort_key: seriesId,
    },
    UpdateExpression: 'set updatedAt=:updatedAt, updatedBy=:updatedBy, #level=:level',
    ExpressionAttributeNames: {
      '#level': 'level'
    },
    ExpressionAttributeValues: {
      ':updatedAt': now.toISOString(),
      ':updatedBy': token.sub,
      ':level': bookId
    },
    ReturnValues: 'ALL_NEW'
  };

  const { Attributes: result } = await dynamodb.update(params).promise();

  result.userId = result.primary_key;
  result.seriesId = result.sort_key;
  delete result.primary_key;
  delete result.sort_key;

  return result;
}