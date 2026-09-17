import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { QueryLoanApplicationsDto } from './dto/query-loan-applicatios.dto';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';
import { formatDateOnly } from '../common/utils/date.utils';

type InstallmentInsert = {
  loan_application_id: number;
  due_date: string;
  amount: number;
  paid: boolean;
};

@Injectable()
export class LoanApplicationsService {
    constructor(private readonly databaseService: DatabaseService){}

   async findAll(query: QueryLoanApplicationsDto){
    const{page, limit, status, from, until, search} = query;
    const offset = (page - 1) * limit;

    const baseQuery = this.databaseService.connection('loan_application').join('client', 'client.id', 'loan_application.client_id');

    if(status) baseQuery.where('status', status)
    if(from) baseQuery.where('loan_application.created_at', '>=', from);
    if(until) baseQuery.where('loan_application.created_at', '<=', until);
    if(search) baseQuery.where('client.full_name', 'like', `%${search}%`);

    const data = await baseQuery.clone().limit(limit).offset(offset).select(
    'loan_application.id',
    'loan_application.client_id',
    'loan_application.requested_amount',
    'loan_application.term_months',
    'loan_application.status',
    'loan_application.created_at',
    'client.full_name as client_name',
    )
    .orderBy('loan_application.created_at','desc')
    .orderBy('loan_application.id','desc');

    const [{total}] = await baseQuery.clone().count({total: '*'})

    return{
        data,
        meta: {page, limit, total: Number(total)},
    }
   }

   async create(dto: CreateLoanApplicationDto){
        const {client_id, requested_amount, term_months, status} = dto;
        
        const client = await this.databaseService.connection('client').where('id', client_id).first();

        if(!client){
            throw new NotFoundException(`Client with id ${client_id} not found`);
        }

        return this.databaseService.connection.transaction(async (trx) =>{
            const [loanApplicationId] = await trx('loan_application').insert({
                client_id,
                requested_amount,
                term_months,
                status: status ?? 'pending',
            });

           let installments: InstallmentInsert[] = [];

            if (status === 'approved') {
            installments = this.buildInstallments(
                requested_amount,
                term_months,
                loanApplicationId,
            );

            await trx('installment').insert(installments);
            }

            return{
                id: loanApplicationId,
                client_id,
                requested_amount,
                term_months,
                status: status ?? 'pending',
                installments,
            };

        });
   };

    private buildInstallments(requested_amount: number,term_months: number,id: number,
    ): InstallmentInsert[] {
    const installments: InstallmentInsert[] = [];

    const baseAmount = Math.floor((requested_amount / term_months) * 100) / 100;
    const lastAmount = Number((requested_amount - baseAmount * (term_months - 1)).toFixed(2));
    
    const startDate = new Date();
    const originalDay = startDate.getDate();

    for (let i = 0; i < term_months; i++) {
    const targetMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + i + 1,
    1,
    );

    const lastDayOfMonth = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth() + 1,
    0,
    ).getDate();

    targetMonth.setDate(Math.min(originalDay, lastDayOfMonth));

    const dueDate = formatDateOnly(targetMonth);

        installments.push({
            loan_application_id: id,
            due_date: dueDate,
            amount: i === term_months - 1 ? lastAmount : baseAmount,
            paid: false,
        })
    
    }
    
    return installments;
   }
}
