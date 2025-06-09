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



makePayment('stripe', 79, 'usd', 'pm_card_visa', 'Test payment using Stripe');