const StripeService = require('./src/gateways/stripeService');

class PaymentFactory {
    static getPaymentService(paymentType) {
        switch (paymentType) {
            case 'stripe':
                return new StripeService();
        }
    }
}

module .exports = PaymentFactory;