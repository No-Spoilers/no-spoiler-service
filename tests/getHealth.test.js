import { expect } from 'chai';

import { handler } from '../src/handlers/health/getHealth.js';

describe('getHealth', () => {

  it('should return 200', async () => {
    const result = await handler();

    expect(result).to.have.all.keys(
      'statusCode',
      'body'
    );

    const { statusCode, body } = result;

    expect(statusCode).to.equal(200);

    const parsedBody = JSON.parse(body);

    expect(parsedBody).to.have.all.keys(
      'nodeVersion',
      'packageVersion'
    );
  });
});
