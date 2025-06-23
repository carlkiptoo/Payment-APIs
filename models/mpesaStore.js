const moongose = require('moongose');

const mpesaTransactionSchema = new moongose.Schema({
    checkoutRequestId: {
        type: String,
        unique: true,
        sparse: true
    },
    merchantRequestId: {
        type: String,
        sparse: true
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    mpesaReceiptNumber: {
        type: String,
        sparse: true
    },

    phoneNumber: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    accountReference: {
        type: String,
        required: true
    },
    transactionDescription: {
        type: String,
        default: 'Pay via MPesa'
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'cancelled', 'timeout'],
        default: 'pending'
    },
    resultCode: {
        type: String,
        default: null
    },
    resultDescription: {
        type: String,
        default: null
    },
    userId: {
        type: String,
        default: null
    },
    orderId: {
        type: String,
        default: null
    },
    transactionDate: {
        type: Date,
        default: null
    },
    rawCallbackData: {
        type: moongose.Schema.Types.Mixed,
        default: null
    }
}, {
        timestamps: true
});

mpesaTransactionSchema.index({phoneNumber: 1}, {createdAt});