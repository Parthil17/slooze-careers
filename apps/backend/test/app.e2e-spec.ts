import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Food Ordering API (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let memberToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nick.fury@slooze.com', password: 'Password123!' });

    const memberLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'thanos@slooze.com', password: 'Password123!' });

    adminToken = adminLogin.body.access_token;
    memberToken = memberLogin.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login returns token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nick.fury@slooze.com', password: 'Password123!' })
      .expect(200);

    expect(res.body.access_token).toBeDefined();
    expect(res.body.role).toBe('ADMIN');
  });

  it('GET /restaurants returns country-filtered data for member', async () => {
    const res = await request(app.getHttpServer())
      .get('/restaurants')
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);

    expect(res.body.every((r: { country: string }) => r.country === 'INDIA')).toBe(true);
  });

  it('POST /orders/:id/checkout returns 403 for member', async () => {
    const orders = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${memberToken}`);

    const draft = orders.body.find((o: { status: string }) => o.status === 'DRAFT');
    if (!draft) return;

    await request(app.getHttpServer())
      .post(`/orders/${draft.id}/checkout`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);
  });

  it('GET /users/me returns permissions', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.permissions).toContain('UPDATE_PAYMENT_METHOD');
  });
});
