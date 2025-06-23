require("dotenv").config();
const axios = require("axios");
const moment = require("moment");
const { Transaction } = require("mongodb");

class MpesaPaymentService {
  async createStkPush({
    amount,
    phone = "254708374149",
    accountReference,
    description,
  }) {
    const token = await this.getToken();
    console.log(token);

    const timeStamp = moment().format("YYYYMMDDHHmmss");

    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timeStamp}`
    ).toString("base64");

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timeStamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: 'payment',
    };

    try {
      const response = await axios.post(
        `https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.log("Error creating Mpesa stk push", error);
      return {
        success: false,
        error: {
          message: error.message,
          type: error.type || "Unknown error",
        },
      };
    }
  }
  async getToken() {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    try {
      const response = await axios.get(
        `https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.log("Error getting Mpesa token", error);
      return {
        success: false,
        error: {
          message: error.message,
          type: error.type || "Unknown error",
        },
      };
    }
  }
}

module.exports = MpesaPaymentService;
