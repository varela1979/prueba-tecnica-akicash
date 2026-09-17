import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min,IsIn, IsDate, IsString } from "class-validator";
import { LOAN_STATUSES, type LoanStatus } from './create-loan-application.dto';
import { IsAfterOrEqual } from "src/common/validators/is-after-or-equal.decorator";

export class QueryLoanApplicationsDto{
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 10;

    @IsOptional()
    @IsIn(LOAN_STATUSES)
    status?: LoanStatus;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    from?: Date

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    @IsAfterOrEqual('from')
    until?: Date

    @IsOptional()
    @IsString()
    search?: string;
}