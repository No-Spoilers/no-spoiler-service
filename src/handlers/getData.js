async function getData(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello world from getData endpoint' }),
  };
}

export const handler = getData;
