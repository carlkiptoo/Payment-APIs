const { version } = require("react");
const PaymentFactory = require("../paymentFactory");
const { Timestamp } = require("mongodb");

class paymentController {
  async makePayment(gateway, amount, currency, source, description) {
    try {
      if (!gateway) {
        throw new Error("Gateway is required");
      }
      if (!PaymentFactory.isPaymentTypeSupported(gateway)) {
        throw new Error(`Gateway ${gateway} is not supported`);
      }
      console.log(`Processing payment for gateway ${gateway}`, {
        amount,
        currency,
        source,
        description,
      });

      const paymentService = PaymentFactory.getPaymentService(gateway);
      const result = await paymentService.charge(
        amount,
        source,
        currency,
        description
      );

      if (result.success) {
        console.log("Payment successful", {
          paymentIntentId: result.paymentIntentId,
          status: result.status,
          amount: result.amount,
          current: result.currency,
        });
      } else {
        console.log("Payment failed", result.error);
      }
      console.log("Payment result", result);
      console.log(result);
    } catch (error) {
      console.log("Error making payment", error.message);
      return {
        success: false,
        error: {
          message: error.message,
          type: "Payment failed",
        },
      };
    }
  }

  async handleDirectPayment(req, res) {
    try {
        const {gateway, amount, currency='usd', paymentMethod, description} = req.body;

        if (!gateway || !amount || !paymentMethod) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Missing required fields',
                    requiredFields: ['gateway', 'amount', 'paymentMethod']
                }
            })
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Amount must be greater than 0'
                }
            })
        }

        const result = await this.makePayment(gateway, amount, currency, paymentMethod, description);

        const statusCode = result.success ? 200 : 400;

        return res.status(statusCode).json(result);

    } catch (error) {
        console.error('Error handling direct payment', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                type: error.type || 'Server error',
            }
        })
    }
  }

  async handlePaymentIntent(req, res) {
    try{
        const { gateway, amount, currency='usd', description} = req.body;
        if (!gateway || !amount) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Missing required fields',
                    requiredFields: ['gateway', 'amount']
                }
            })

        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Amount must be greater than 0'
                }
            })
        }

        if (!PaymentFactory.isPaymentTypeSupported(gateway)) {
            res.status(400).json({
                success: false,
                error:{
                   message: `Unsupported gateway ${gateway}`,
                   gateway: gateway
                }
            })
        }

        const paymentService = PaymentFactory.getPaymentService(gateway);

        if (typeof paymentService.createPaymentIntent === 'function') {
            const result = await paymentService.createPaymentIntent(amount, currency, description);
            const statusCode = result.success ? 200 : 400

            res.status(statusCode).json(result)
        } else {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Payment creation intent not supported for this gateway',
                    gateway: gateway
                }
            })
        }
    } catch (error) {
        console.error('Payment intent API error', error)
        res.status(500).json({
            message: 'Failed to create payment intent',
            error: 'server_error'
        })
    }
  }

  async handleHealthCheck(req, res) {
    try {
        const supportedGateways = PaymentFactory.getSupportedPaymentTypes();

        res.json({
            status: 'ok',
            service: 'Payment APIs',
            supportedGateways: {
                list: supportedGateways,
                count: supportedGateways.length

            },
            version: 1.0,
            Timestamp: new Timestamp(Date.now()),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,

        })
    }catch (error) {
        console.error('Error handling health check', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Health check failed',
                type: error.type || 'Server error',
                Timestamp: new Timestamp(Date.now())
            }
        })
    }
  }
}
