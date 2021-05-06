import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbUpdateBook(bookData, token) {
  const { seriesId, bookId } = bookData;
  const now = new Date();
  if (bookData.pubDate) {
    bookData.pubDate = new Date(bookData.pubDate).toISOString();
  }

  let updateExpression = 'set updatedAt = :updatedAt, updatedBy=:updatedBy';

  const expressionAttributeValues = {
    ':updatedAt': now.toISOString(),
    ':updatedBy': token.sub
  }

  const expressionAttributeNames = {};

  const validFields = ['name', 'text', 'pubDate'];

  validFields.forEach(field => {
    if (bookData[field]) {
      updateExpression += `, #${field} = :${field}`;
      expressionAttributeNames[`#${field}`] = `${field}`;
      expressionAttributeValues[`:${field}`] = bookData[field];
    }
  })

  const params = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Key:{
      primary_key: seriesId,
      sort_key: bookId,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };

  const { Attributes: result } = await dynamodb.update(params).promise();

  result.seriesId = result.primary_key;
  result.bookId = result.sort_key;
  delete result.primary_key;
  delete result.sort_key;

  return result;
}