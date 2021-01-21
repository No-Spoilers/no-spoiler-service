const schema = {
  properties: {
    body: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        password: { type: 'string' }
      },
      required: [ 'userId', 'password' ]
    }
  },
  required: [ 'body' ]
};

export default schema;