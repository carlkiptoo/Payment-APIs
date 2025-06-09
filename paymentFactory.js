const StripeService = require("./src/gateways/stripeService");

class PaymentFactory {
  static getPaymentService(paymentType) {
    if (!paymentType || typeof paymentType !== "string") {
      throw new Error("Payment type must be a string");
    }
    const normalizedType = paymentType.toLowerCase().trim();

    switch (normalizedType) {
      case "stripe":
        return new StripeService();

      default: {
        throw new Error(`Unsupported payment type: ${paymentType}`);
      }
    }
  }
  static getSupportedPaymentTypes() {
    return ["stripe"];
  }
  static isPaymentTypeSupported(paymentType) {
    if (!paymentType) return false;
    return this.getSupportedPaymentTypes().includes(paymentType.toLowerCase().trim());

  }
}

module.exports = PaymentFactory;
