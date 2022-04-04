async function getHealth() {
  try {
    const responseBody = {
      node: process.version
    };

    const body = JSON.stringify(responseBody);

    return {
      statusCode: 200,
      body
    }
  } catch (error) {
    console.error(error);
  }
}

export const handler = getHealth;
