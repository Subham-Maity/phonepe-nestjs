export class PaymentResponseDto {
  success: boolean;
  code: string;
  message: string;
  data: {
    merchantId: string;
    merchantTransactionId: string;
    instrumentResponse: {
      redirectInfo: {
        url: string;
      };
    };
  };
}
