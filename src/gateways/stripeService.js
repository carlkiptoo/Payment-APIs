const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
    async charge(amount, source, currency = 'usd', description) {
        try{
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency,
                description: description || 'Test payment using Stripe',
                payment_method_types: ['card'],
                payment_method: source,
                confirm: true

            });
            console.log('Stripe payment intent created', paymentIntent.id);
            return paymentIntent;
        } catch (error) {
            console.log('Error creating Stripe payment intent', error);
            throw error;
        }

    }
}
module.exports = StripeService;


