import {
  Body,
  Controller,
  Logger,
  Post,
  Query,
  Redirect,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('order')
  async createPayment(@Body() paymentDto: CreatePaymentDto) {
    this.logger.log(
      `Payment request received for transaction: ${paymentDto.transactionId}`,
    );
    try {
      const result = await this.paymentService.createPayment(paymentDto);
      this.logger.log(
        `Payment request processed successfully for transaction: ${paymentDto.transactionId}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Payment request failed for transaction: ${paymentDto.transactionId}`,
        {
          error: error.message,
          stack: error.stack,
        },
      );
      throw error;
    }
  }

  @Post('status')
  @Redirect()
  async checkPaymentStatus(@Query('id') transactionId: string) {
    this.logger.log(
      `Status check request received for transaction: ${transactionId}`,
    );
    try {
      const result =
        await this.paymentService.checkPaymentStatus(transactionId);
      this.logger.log(
        `Status check completed for transaction: ${transactionId}`,
      );
      return { url: result.redirectUrl };
    } catch (error) {
      this.logger.error(
        `Status check failed for transaction: ${transactionId}`,
        {
          error: error.message,
          stack: error.stack,
        },
      );
      throw error;
    }
  }
}
