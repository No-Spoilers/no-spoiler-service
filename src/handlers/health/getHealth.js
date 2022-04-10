async function getHealth() {
  try {
    const responseBody = {
      node: process.version
    };

    return {
      statusCode: 200,
      body: JSON.stringify(responseBody)
    }
  } catch (error) {
    console.error(error);
  }
}

export const handler = getHealth;
