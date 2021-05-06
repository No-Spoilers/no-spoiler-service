import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbCreateBook({pubDate, seriesId, bookId, name, text}, token) {
  const now = new Date();
  const formattedDate = new Date(pubDate).toISOString();

  const book = {
    primary_key: seriesId,
    sort_key: bookId,
    name,
    text,
    pubDate: formattedDate,
    createdBy: token.sub,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }

  const params = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Key:{
      primary_key: seriesId,
      sort_key: bookId,
    },
    UpdateExpression: 'set #n=:name, #t=:text, pubDate=:pubDate, updatedAt=:updatedAt, updatedBy=:updatedBy',
    ExpressionAttributeNames: {
      '#n': 'name',
      '#t': 'text'
    },
    ExpressionAttributeValues:{
        ':name': name,
        ':text': text,
        ':pubDate': formattedDate,
        ':updatedAt': now.toISOString(),
        ':updatedBy': token.sub
    },
    ReturnValues:'UPDATED_NEW'
};

  const result = await dynamodb.update(params).promise();

  console.log('result:', result);

  book.seriesId = book.primary_key;
  book.bookId = book.sort_key;
  delete book.primary_key;
  delete book.sort_key;

  return book;
}