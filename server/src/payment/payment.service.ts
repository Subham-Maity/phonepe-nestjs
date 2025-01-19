import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PaymentInitiationError, PaymentStatusError } from './exceptions';
import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';
import { PaymentConfig } from './types';
import { CreatePaymentDto } from './dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly config: PaymentConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      saltKey: this.configService.get<string>('PHONEPE_SALT_KEY'),
      merchantId: this.configService.get<string>('PHONEPE_MERCHANT_ID'),
      redirectBaseUrl: this.configService.get<string>('REDIRECT_BASE_URL'),
      apiBaseUrl: this.configService.get<string>('PHONEPE_API_BASE_URL'),
    };

    // Validate config
    Object.entries(this.config).forEach(([key, value]) => {
      if (!value) {
        throw new Error(`Missing configuration: ${key}`);
      }
    });
  }

  async createPayment(paymentDto: CreatePaymentDto) {
    this.logger.log(
      `Initiating payment for transaction: ${paymentDto.transactionId}`,
    );

    try {
      // Validate amount
      if (paymentDto.amount <= 0) {
        throw new PaymentInitiationError({ message: 'Invalid amount' });
      }

      const payload = {
        merchantId: this.config.merchantId,
        merchantTransactionId: paymentDto.transactionId,
        name: paymentDto.name,
        amount: paymentDto.amount * 100,
        redirectUrl: `${this.config.redirectBaseUrl}/payment/status?id=${paymentDto.transactionId}`,
        redirectMode: 'POST',
        mobileNumber: paymentDto.phone,
        paymentInstrument: {
          type: 'PAY_PAGE',
        },
      };

      this.logger.debug('Payment payload:', payload);

      const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString(
        'base64',
      );
      const checksum = this.generateChecksum(payloadBase64, '/pg/v1/pay');

      const response = await axios({
        method: 'POST',
        url: `${this.config.apiBaseUrl}/pg/v1/pay`,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        },
        data: {
          request: payloadBase64,
        },
      });

      this.logger.log(
        `Payment initiated successfully for transaction: ${paymentDto.transactionId}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Payment initiation failed:', {
        transactionId: paymentDto.transactionId,
        error: error.response?.data || error.message,
        stack: error.stack,
      });

      if (error instanceof AxiosError) {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Payment Gateway Error',
            message: error.response?.data?.message || error.message,
            details: error.response?.data,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new PaymentInitiationError(error);
    }
  }

  async checkPaymentStatus(transactionId: string) {
    this.logger.log(
      `Checking payment status for transaction: ${transactionId}`,
    );

    try {
      const endpoint = `/pg/v1/status/${this.config.merchantId}/${transactionId}`;
      const checksum = this.generateChecksum('', endpoint);

      const response = await axios({
        method: 'GET',
        url: `${this.config.apiBaseUrl}${endpoint}`,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': this.config.merchantId,
        },
      });

      this.logger.log(
        `Payment status checked successfully for transaction: ${transactionId}`,
      );

      return {
        success: response.data.success,
        redirectUrl: response.data.success
          ? `${this.config.redirectBaseUrl}/success`
          : `${this.config.redirectBaseUrl}/fail`,
        details: response.data,
      };
    } catch (error) {
      this.logger.error('Payment status check failed:', {
        transactionId,
        error: error.response?.data || error.message,
        stack: error.stack,
      });

      if (error instanceof AxiosError) {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Payment Status Check Failed',
            message: error.response?.data?.message || error.message,
            details: error.response?.data,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new PaymentStatusError(error);
    }
  }

  private generateChecksum(payload: string, endpoint: string): string {
    try {
      const keyIndex = 1;
      const string = payload + endpoint + this.config.saltKey;
      const sha256 = crypto.createHash('sha256').update(string).digest('hex');
      return `${sha256}###${keyIndex}`;
    } catch (error) {
      this.logger.error(`Checksum generation failed: ${error.message}`);
      throw new Error('Failed to generate checksum');
    }
  }
}
