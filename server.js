require('dotenv').config();

const PaymentFactory = require('./paymentFactory');

const app = require('express')();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
app.use(bodyParser.json());

async function makePayment(gateway, amount, currency, source, description) {
    try {
        const paymentService = PaymentFactory.getPaymentService(gateway);
        const result = await paymentService.charge(amount, source, currency, description)
        console.log('Payment result', result);
        console.log(result)
    } catch (error) {
        console.log('Error making payment', error);
    }
}

makePayment('stripe', 79, 'usd', 'pm_card_visa', 'Test payment using Stripe');