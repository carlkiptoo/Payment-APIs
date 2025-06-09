const express = require('express');
const paymentController = require('../../controllers/paymentController');

const router = express.Router();

router.post('/payments', (req, res) => {
    paymentController.handleDirectPayment(req, res);
}) ;

router.post('/payment/intents', (req, res) => {
    paymentController.handlePaymentIntent(req, res);
});

router.get('/payments/gateways', (req, res) => {
    paymentController.handleGetSupportedGateways(req, res);
})

router.get('/payments/health', (req, res) => {
    paymentController.handleHealthCheck(req, res);
})

router.get('/payment/status/:paymentId', (req, res) =>{
    try {
        const {paymentId} = req.params;
        const {gateway} = req.query;

        if (!gateway) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Gateway is required',
                    example: '/api/payments/pi_1234567890/status?gateway=stripe'
                }
            })
        }

        const result = paymentController.getPaymentStatus(paymentId, gateway);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error('Error handling payment status', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                type: error.type || 'Server error',
            }
        })

    }
})

router.processPayment = async (gateway, amount, currency, source, description) =>{
    return await paymentController.makePayment(gateway, amount, currency, source, description);
}

module.exports = router;