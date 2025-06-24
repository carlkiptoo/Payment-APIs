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
      const {
        gateway,
        amount,
        currency = "usd",
        paymentMethod,
        description,
      } = req.body;

      if (!gateway || !amount || !paymentMethod) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Missing required fields",
            requiredFields: ["gateway", "amount", "paymentMethod"],
          },
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Amount must be greater than 0",
          },
        });
      }

      const result = await this.makePayment(
        gateway,
        amount,
        currency,
        paymentMethod,
        description
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error handling direct payment", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Internal server error",
          type: error.type || "Server error",
        },
      });
    }
  }

  async handlePaymentIntent(req, res) {
    try {
      const {
        gateway,
        amount,
        currency = "usd",
        description,
        source,
      } = req.body;
      if (!gateway || !amount) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Missing required fields",
            requiredFields: ["gateway", "amount"],
          },
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Amount must be greater than 0",
          },
        });
      }

      if (!PaymentFactory.isPaymentTypeSupported(gateway)) {
        res.status(400).json({
          success: false,
          error: {
            message: `Unsupported gateway ${gateway}`,
            gateway: gateway,
          },
        });
      }

      const paymentService = PaymentFactory.getPaymentService(gateway);

      if (typeof paymentService.charge === "function") {
        const result = await paymentService.charge(amount, source, currency);
        const statusCode = result.success ? 200 : 400;

        res.status(statusCode).json(result);
      } else {
        res.status(400).json({
          success: false,
          error: {
            message: "Payment creation intent not supported for this gateway",
            gateway: gateway,
          },
        });
      }
    } catch (error) {
      console.error("Payment intent API error", error);
      res.status(500).json({
        message: "Failed to create payment intent",
        error: "server_error",
      });
    }
  }

  async handleHealthCheck(req, res) {
    try {
      const supportedGateways = PaymentFactory.getSupportedPaymentTypes();

      res.json({
        status: "ok",
        service: "Payment APIs",
        supportedGateways: {
          list: supportedGateways,
          count: supportedGateways.length,
        },
        version: 1.0,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      });
    } catch (error) {
      console.error("Error handling health check", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Health check failed",
          type: error.type || "Server error",
        },
      });
    }
  }

  validatePaymentData(data) {
    const errors = [];

    if (!data.gateway) errors.push("Gateway is required");
    if (!data.amount) errors.push("Amount is required");
    if (!data.currency) errors.push("Currency is required");
    if (!data.paymentMethod) errors.push("Payment method is required");
    if (data.amount <= 0) errors.push("Amount must be greater than 0");
    if (!PaymentFactory.isPaymentTypeSupported(data.gateway)) {
      errors.push(`Gateway ${data.gateway} is not supported`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getPaymentStatus(paymentId, gateway) {
    try {
      if (!paymentId && !gateway) {
        throw new Error("Payment ID or gateway is required");
      }

      const paymentService = PaymentFactory.getPaymentService(gateway);

      if (typeof paymentService.getPaymentStatus === "function") {
        return await paymentService.getPaymentStatus(paymentId);
      } else {
        return {
          success: false,
          error: {
            message: "Payment status not supported for this gateway",
            gateway: gateway,
          },
        };
      }
    } catch (error) {
      console.error("Error getting payment status", error);
      return {
        success: false,
        error: {
          message: "Failed to get payment status",
          type: error.type || "Server error",
        },
      };
    }
  }

  async handleStkPush(req, res) {
    console.log("Received STK Push request");

    try {
      const {
        amount,
        phone,
        description,
        accountReference = "Ref001",
      } = req.body;

      if (!amount || !phone) {
        return res.status(400).json({
          success: false,
          error: { "Missing required fields": ["amount", "phone"] },
        });
      }

      const mpesa = PaymentFactory.getPaymentService("mpesa");
      const result = await mpesa.createStkPush({
        amount,
        phoneNumber: phone,
        description,
        accountReference,
      });

       console.log("STK Push Result:", result);

      if (result.success) {
        return res.status(200).json(result.data);
      } else {
        return res.status(500).json(result.error);
      }

    //   return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Error handling stk push", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Internal server error",
          type: error.type || "Server error",
        },
      });
    }
  }

   handleStkPushCallback = (req, res) => {
    try {

        console.log("STK Callback body", JSON.stringify(req.body, null ,2));
        const callbackData = req.body?.Body?.stkCallback;

        if (!callbackData) {
            console.error("Callback data is malformed", req.body);
            return res.status(400).json({
                success: false,
                error: {
                    message: "Callback data is malformed",
                    type: "Malformed callback data",
                },
            });
        }

        console.log('Callback received from safaricom: ', JSON.stringify(callbackData));

        if (callbackData.resultCode === '0') {
            const metadata = callbackData.CallbackMetadata.Item;

            const amount = metadata.find(item => item.Name === "Amount")?.Value;
            const phone = metadata.find(item => item.Name === "phoneNumber")?.Value;
            const transactionDate = metadata.find(item => item.Name === 'TransactionDate')?.Value;
            const receipt = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;

            console.log('Transaction successful:');
            console.log({amount, receipt, phone, transactionDate});



        } else {
            console.log('Transaction failed');

        }
        res.status(200).json({message: "Callback received successfully"});
    } catch (error) {
        console.error('Error processing callback', error);
        res.status(500).json({error: "Error processing callback"});
    }
   }
}

module.exports = new paymentController();
