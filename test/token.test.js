import { expect } from 'chai';

import { createNewToken, verifyToken } from '../src/lib/token.js';

describe('token', () => {
  it('should create a new verifiable token', async () => {
    const user = {
      userId: 'test id'
    };

    const result = createNewToken(user);

    expect(typeof result).to.equal('string');

    const verifiedToken = verifyToken(result);

    expect(typeof verifiedToken).to.equal('object');
    expect(verifiedToken).to.have.all.keys(
      'iat',
      'exp',
      'sub',
      'jti'
    )
    expect(verifiedToken.sub).to.equal('test id');

  });
});
