import React from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

import CardSection from './CardSection';

const URL = 'http://localhost:5000';
const productId = 213;

const handleServerResponse = async response => {
  if (response.error) {
    // Show error from server on payment form
  } else if (response.requires_action) {
    // Use Stripe.js to handle the required card action
    const { error: errorAction, paymentIntent } = await stripe.handleCardAction(
      response.payment_intent_client_secret
    );

    if (errorAction) {
      // Show error from Stripe.js in payment form
    } else {
      // The card action has been handled
      // The PaymentIntent can be confirmed again on the server
      // const serverResponse = await fetch(`${URL}/bids`, {
      const serverResponse = await fetch(`${URL}/products/${productId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authentication:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJyaXRuZXk0OEBnbWFpbC5jb20iLCJpYXQiOjE2OTA3MDM3NDgsImV4cCI6MTY5MDczOTc0OH0.ndOUwQs1EX2u3NyTCc5a5OPDuc8NpJR3-DjBAicJgr0',
          refresh:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJyaXRuZXk0OEBnbWFpbC5jb20iLCJpYXQiOjE2OTA3MDM3NDgsImV4cCI6MTY5MDc1MTc0OH0.Z_OVFlO_H72Lu3VC5dC7-p5pJyvTjfwxtHo9dtOMZ74'
        },
        body: JSON.stringify({ payment_intent_id: paymentIntent.id })
      });
      handleServerResponse(await serverResponse.json());
    }
  } else {
    // Show success message
  }
};
const stripePaymentMethodHandler = async result => {
  if (result.error) {
    // Show error in payment form
  } else {
    // Otherwise send paymentMethod.id to your server (see Step 4)
    const res = await fetch(`${URL}/products/${productId}/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authentication:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJyaXRuZXk0OEBnbWFpbC5jb20iLCJpYXQiOjE2OTA3MDM3NDgsImV4cCI6MTY5MDczOTc0OH0.ndOUwQs1EX2u3NyTCc5a5OPDuc8NpJR3-DjBAicJgr0',
        refresh:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJyaXRuZXk0OEBnbWFpbC5jb20iLCJpYXQiOjE2OTA3MDM3NDgsImV4cCI6MTY5MDc1MTc0OH0.Z_OVFlO_H72Lu3VC5dC7-p5pJyvTjfwxtHo9dtOMZ74'
      },
      body: JSON.stringify({
        payment_method_id: result.paymentMethod.id,
        //* random between 800 and 1600
        price: Math.floor(Math.random() * 800) + 800,

        // * random future date

        expiration_date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),

        shipping_address: '{{$randomStreetAddress}}',
        // card_details_number: '424242424242424242',
        // card_details_expiration_date: '{{$randomDateFuture}}',
        // card_details_cvv: '{{$randomInt}}',
        product: 213
      })
    });
    const paymentResponse = await res.json();

    // Handle server response (see Step 4)
    console.log('paymentReponse', paymentReponse);
    handleServerResponse(paymentResponse);
  }
};

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async event => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const result = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
      billing_details: {
        // Include any additional collected billing details.
        name: 'Jenny Rosen'
      }
    });

    stripePaymentMethodHandler(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardSection />
      <button type='submit' disabled={!stripe}>
        Submit Payment
      </button>
    </form>
  );
}
