import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DatabaseService } from '../src/database/database.service';
import { LoanApplicationsController } from '../src/loan-applications/loan-applications.controller';
import { LoanApplicationsService } from '../src/loan-applications/loan-applications.service';
import { createValidationPipe } from '../src/common/validation.pipe';

// Real routing, DTO validation and service logic; database access is mocked.
// These tests do not verify MySQL persistence or transaction rollback.
describe('Loan applications (HTTP)', () => {
  let app: INestApplication<App>;
  let service: LoanApplicationsService;

  const firstClient = jest.fn();
  const insertLoan = jest.fn();
  const insertInstallments = jest.fn();
  const clientQuery = { where: jest.fn().mockReturnThis(), first: firstClient };
  const trx = jest.fn((table: string) => {
    if (table === 'loan_application') return { insert: insertLoan };
    if (table === 'installment') return { insert: insertInstallments };
    throw new Error(`Unexpected table: ${table}`);
  });
  const transaction = jest.fn(
    (callback: (query: typeof trx) => Promise<unknown>) => callback(trx),
  );
  const connection = Object.assign(
    jest.fn((table: string) => {
      if (table === 'client') return clientQuery;
      throw new Error(`Unexpected table: ${table}`);
    }),
    { transaction },
  );

  const validBody = {
    client_id: 1,
    requested_amount: 1000,
    term_months: 6,
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [LoanApplicationsController],
      providers: [
        LoanApplicationsService,
        { provide: DatabaseService, useValue: { connection } },
      ],
    }).compile();

    service = module.get(LoanApplicationsService);
    app = module.createNestApplication();
    app.useGlobalPipes(createValidationPipe());
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    firstClient.mockResolvedValue({ id: 1 });
    insertLoan.mockResolvedValue([10]);
    insertInstallments.mockResolvedValue([]);
  });

  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => app.close());

  it('POST returns 201 and defaults to pending without installments', async () => {
    await request(app.getHttpServer())
      .post('/loan-applications')
      .send(validBody)
      .expect(201)
      .expect({ id: 10, ...validBody, status: 'pending', installments: [] });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(insertLoan).toHaveBeenCalledWith({ ...validBody, status: 'pending' });
    expect(insertInstallments).not.toHaveBeenCalled();
  });

  it('POST approved creates six installments with the requested total', async () => {
    const response = await request(app.getHttpServer())
      .post('/loan-applications')
      .send({ ...validBody, status: 'approved' })
      .expect(201);

    const body = response.body as {
      status: string;
      installments: {
        loan_application_id: number;
        amount: number;
        paid: boolean;
      }[];
    };
    expect(body.status).toBe('approved');
    expect(body.installments).toHaveLength(6);
    const totalCents = body.installments.reduce(
      (sum, row) => sum + Math.round(row.amount * 100),
      0,
    );
    expect(totalCents).toBe(100000);
    expect(
      body.installments.every(
        (row) => row.loan_application_id === 10 && !row.paid,
      ),
    ).toBe(true);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(insertInstallments).toHaveBeenCalledWith(body.installments);
  });

  it('POST returns 404 with a clear message for a missing client', async () => {
    firstClient.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .post('/loan-applications')
      .send({ ...validBody, client_id: 999 })
      .expect(404)
      .expect(({ body }) => {
        expect(body.message).toBe('Client with id 999 not found');
      });

    expect(transaction).not.toHaveBeenCalled();
  });

  const invalidBodies: [string, Record<string, unknown>][] = [
    ['zero amount', { ...validBody, requested_amount: 0 }],
    ['negative amount', { ...validBody, requested_amount: -1 }],
    ['too many decimals', { ...validBody, requested_amount: 1.234 }],
    ['boolean amount', { ...validBody, requested_amount: true }],
    ['boolean client id', { ...validBody, client_id: true }],
    ['zero term', { ...validBody, term_months: 0 }],
    ['negative term', { ...validBody, term_months: -6 }],
    ['fractional term', { ...validBody, term_months: 6.5 }],
    ['unsupported term', { ...validBody, term_months: 3 }],
    ['invalid status', { ...validBody, status: 'invalid' }],
    ['missing client id', { requested_amount: 1000, term_months: 6 }],
    ['missing amount', { client_id: 1, term_months: 6 }],
    ['missing term', { client_id: 1, requested_amount: 1000 }],
    ['unexpected field', { ...validBody, admin: true }],
  ];

  it.each(invalidBodies)(
    'POST rejects %s with 400 before querying the database',
    async (_name, body) => {
      await request(app.getHttpServer())
        .post('/loan-applications')
        .send(body)
        .expect(400);

      expect(connection).not.toHaveBeenCalled();
      expect(transaction).not.toHaveBeenCalled();
    },
  );

  it('GET converts page and limit and leaves omitted dates undefined', async () => {
    const findAll = jest.spyOn(service, 'findAll').mockResolvedValue({
      data: [],
      meta: { page: 2, limit: 5, total: 0 },
    });

    await request(app.getHttpServer())
      .get('/loan-applications?page=2&limit=5')
      .expect(200);

    expect(findAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 5 }),
    );
    const [query] = findAll.mock.calls[0];
    expect(query.from).toBeUndefined();
    expect(query.until).toBeUndefined();
  });
});
