import request from 'supertest';
import app from '../../src/app';

describe('POST /api/stores-exists', () => {
  it('400 when no slug is provided', async () => {
    const res = await request(app).post('/api/stores-exists').send({});
    expect(res.status).toBe(400);
  });

  it('200 and exists=false when store does not exist', async () => {
    // We assume 'non-existent-slug-12345' doesn't exist in the test DB
    const res = await request(app).post('/api/stores-exists').send({ storeSlug: 'non-existent-slug-12345' });
    expect(res.status).toBe(200);
    expect(res.body.exists).toBe(false);
    expect(res.body.storeId).toBe(null);
  });
});
