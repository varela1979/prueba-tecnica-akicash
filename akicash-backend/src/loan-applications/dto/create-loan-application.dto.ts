import { IsInt, IsPositive, IsNumber, IsOptional, IsIn, Max } from 'class-validator';
export const LOAN_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type LoanStatus = typeof LOAN_STATUSES[number];

export class CreateLoanApplicationDto{
    @IsInt()
    @IsPositive()
    client_id: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Max(9999999999.99, {
    message: 'The requested amount must not exceed L 9,999,999,999.99.',
    })
    requested_amount: number;


    @IsInt()
    @IsPositive()
    @IsIn([6, 12, 24, 36, 48, 60, 72])
    term_months: number;

    @IsOptional()
    @IsIn(LOAN_STATUSES)
    status?: LoanStatus;

}