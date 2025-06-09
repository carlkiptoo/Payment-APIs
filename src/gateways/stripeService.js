const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
    async charge(amount, source, currency = 'usd', description) {
        try{
            if (!amount || amount <=0) {
                throw new Error('Amount must be greater than 0');
            }

            if (!source) {
                throw new Error('Payment source is required');
            }

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: currency.toLowerCase(),
                description: description || 'Test payment using Stripe',
                payment_method: source,
                confirm: true,
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: never
                }

            });
            console.log('Stripe payment intent created', paymentIntent.id);
            return {
                success: true,
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency
            }

        } catch (error) {
            console.log('Error creating Stripe payment intent', error);
            return {
                success: false,
                error: {
                    message: error.message,
                    type: error.type || 'Unknown error',
                    code: error.code || 'Payment failed'
                }
            }
        }

    }
}
module.exports = StripeService;


