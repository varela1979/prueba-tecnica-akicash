import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LoanApplicationsService } from './loan-applications.service';
import { QueryLoanApplicationsDto } from './dto/query-loan-applicatios.dto';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';

@Controller('loan-applications')
export class LoanApplicationsController {
    constructor(private readonly loanApplicationsService: LoanApplicationsService){}

    @Get()
    findAll(@Query() query: QueryLoanApplicationsDto) {
        return this.loanApplicationsService.findAll(query);
    }
    
    @Post()
    create(@Body() dto: CreateLoanApplicationDto){
        return this.loanApplicationsService.create(dto);
    }
    
}

