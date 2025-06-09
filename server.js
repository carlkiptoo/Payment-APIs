require('dotenv').config();

const PaymentFactory = require('./paymentFactory');

const app = require('express')();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(err, req, resizeBy, next) {
//     console.error('Unhandled error', err);
//     result.status(500).json({
//         success: false,
//         error: {
//             message: 'Internal server error',
//             ...(process.env.NODE_ENV === 'development' && {details: err.message})
//         }
//     })
// };

async function makePayment(gateway, amount, currency, source, description) {
    try {
        if (!gateway) {
            throw new Error('Gateway is required');
        }
        if (!PaymentFactory.isPaymentTypeSupported(gateway)) {
            throw new Error(`Gateway ${gateway} is not supported`);
        }
        console.log(`Processing payment for gateway ${gateway}`, {
            amount,
            currency,
            source,
            description
        }
        );

        const paymentService = PaymentFactory.getPaymentService(gateway);
        const result = await paymentService.charge(amount, source, currency, description);

        if (result.success) {
            console.log('Payment successful', {
                 paymentIntentId: result.paymentIntentId,
              status: result.status,
             amount: result.amount,
             current:  result.currency

            }
             
            );
        } else {
            console.log('Payment failed', result.error);
        }
        console.log('Payment result', result);
        console.log(result)
    } catch (error) {
        console.log('Error making payment', error.message);
        return {
            success: false,
            error: {
                message: error.message,
                type: 'Payment failed',
            }
        }
    }
}

makePayment('stripe', 79, 'usd', 'pm_card_visa', 'Test payment using Stripe');