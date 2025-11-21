import { handler } from '../src/handlers/health/getHealth.js';

describe('getHealth', () => {
  it('should return 200', async () => {
    const result = await handler();

    if (typeof result === 'string') {
      throw new Error('Result is a string');
    }

    expect(Object.keys(result)).toEqual(['statusCode', 'body']);

    const { statusCode, body } = result;

    if (!statusCode) {
      throw new Error('Status code is undefined');
    }

    expect(statusCode).toBe(200);

    if (typeof body !== 'string') {
      throw new Error('Result is a string');
    }

    const parsedBody: unknown = JSON.parse(body);

    expect(Object.keys(parsedBody as object)).toEqual(['status', 'version']);
  });
});
