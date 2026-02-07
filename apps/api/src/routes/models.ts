import { Hono } from 'hono';
import { PROVIDERS } from '@dexter/core';

const models = new Hono();

models.get('/', (c) => {
  return c.json({
    providers: PROVIDERS
  });
});

export default models;
