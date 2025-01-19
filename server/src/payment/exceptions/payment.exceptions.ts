export class PaymentInitiationError extends Error {
  constructor(public readonly details: any) {
    super('Payment initiation failed');
    this.name = 'PaymentInitiationError';
  }
}

export class PaymentStatusError extends Error {
  constructor(public readonly details: any) {
    super('Payment status check failed');
    this.name = 'PaymentStatusError';
  }
}
