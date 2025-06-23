require("dotenv").config();
const paymentRoutes = require("./src/routes/paymentRoutes");

const PaymentFactory = require("./paymentFactory");

const app = require("express")();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const { stack } = require("./src/routes/paymentRoutes");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cors

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(200);
  } else {
    next();
  }
});

//Routes
app.use("/api", paymentRoutes);
app.use('/api/mpesa', paymentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Payments APIs server",
    version: 1.0,
    endpoints: {
      health: "/api/payments/health",
      payments: "/api/payments",
      paymentIntents: "/api/payment/intents",
      supportedGateways: "/api/payments/gateways",
    },
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
      ...(process.env.NODE_ENV === "development" && {
        details: err.message,
        stack: err.stack,
      }),
    },
  });
});

app.listen(port, () => {
  console.log(`Payment server running on port ${port}`);
  console.log(`Available endpoints:`);
  console.log(` GET http://localhost:${port}/`);
  console.log(` POST http://localhost:${port}/api/payments`);
  console.log(` POST http://localhost:${port}/api/payment/intents`);
  console.log(` GET http://localhost:${port}/api/payments/gateways`);
  console.log(` GET http://localhost:${port}/api/payments/health`);
});

async function testPayment() {
  if (process.env.NODE_ENV === "development") {
    console.log("Running test payments");

    try {
      const paymentController = require("./controllers/paymentController");

      const result = await paymentController.makePayment(
        "stripe",
        90,
        "usd",
        "pm_card_visa",
        "Test payment using Stripe"
      );

      console.log("Test payment result", result);
      console.log("Test complete");
    } catch (error) {
      console.error("Error running test payment", error);
    }
  }
}

if (process.env.NODE_ENV === "development") {
  setTimeout(testPayment, 1000);
}

module.exports = app;
