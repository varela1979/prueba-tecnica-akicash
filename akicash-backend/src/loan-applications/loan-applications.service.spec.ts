import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LoanApplicationsService } from './loan-applications.service';
import { DatabaseService } from '../database/database.service';

describe('LoanApplicationsService', () => {
  let service: LoanApplicationsService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    first: jest.fn(),
  };

  const mockTrx: any = jest.fn();

  const mockConnection: any = jest.fn(() => mockQueryBuilder);
  mockConnection.transaction = jest.fn((callback: any) => callback(mockTrx));

  const mockDatabaseService = {
    connection: mockConnection,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanApplicationsService,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<LoanApplicationsService>(LoanApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException when client does not exist', async () => {
      mockQueryBuilder.first.mockResolvedValue(undefined);

      await expect(
        service.create({ client_id: 999, requested_amount: 5000, term_months: 12 } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create a pending loan application without installments', async () => {
      mockQueryBuilder.first.mockResolvedValue({ id: 1, full_name: 'Test Client' });

      const insertLoanApplication = jest.fn().mockResolvedValue([10]);
      mockTrx.mockImplementation((table: string) => {
        if (table === 'loan_application') return { insert: insertLoanApplication };
        throw new Error(`Unexpected table: ${table}`);
      });

      const result = await service.create({
        client_id: 1,
        requested_amount: 50000,
        term_months: 12,
      } as any);

      expect(result.id).toBe(10);
      expect(result.status).toBe('pending');
      expect(result.installments).toEqual([]);
    });

    it('should generate installments summing exactly the requested amount when approved', async () => {
      mockQueryBuilder.first.mockResolvedValue({ id: 1, full_name: 'Test Client' });

      const insertLoanApplication = jest.fn().mockResolvedValue([20]);
      const insertInstallments = jest.fn().mockResolvedValue([]);
      mockTrx.mockImplementation((table: string) => {
        if (table === 'loan_application') return { insert: insertLoanApplication };
        if (table === 'installment') return { insert: insertInstallments };
        throw new Error(`Unexpected table: ${table}`);
      });

      const result = await service.create({
        client_id: 1,
        requested_amount: 100000,
        term_months: 3,
        status: 'approved',
      } as any);

      expect(insertInstallments).toHaveBeenCalledTimes(1);

      const insertedInstallments = insertInstallments.mock.calls[0][0];
      expect(insertedInstallments).toHaveLength(3);

      const sum = insertedInstallments.reduce((acc: number, i: any) => acc + i.amount, 0);
      expect(Number(sum.toFixed(2))).toBe(100000);
      expect(result.status).toBe('approved');
    });
  });
});