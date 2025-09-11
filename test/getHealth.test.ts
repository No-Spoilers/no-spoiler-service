import { expect } from 'chai';
import { event, mockContext } from './test-helpers.js';
import { handler } from '../src/handlers/health/getHealth.js';

describe('getHealth', () => {
  it('should return 200', async () => {
    const result = await handler(event, mockContext);

    if (typeof result === 'string') {
      throw new Error('Result is a string');
    }

    expect(result).to.have.all.keys('statusCode', 'body', 'headers');

    const { statusCode, body } = result;

    if (!statusCode) {
      throw new Error('Status code is undefined');
    }

    expect(statusCode).to.equal(200);

    if (typeof body !== 'string') {
      throw new Error('Result is a string');
    }

    const parsedBody: unknown = JSON.parse(body);

    expect(parsedBody).to.have.all.keys('packageVersion');
  });
});
