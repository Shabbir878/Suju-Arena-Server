/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import config from '../../config';

export const initiatePayment = async (paymentData: any) => {
  // console.log(config.payment_url, config.signature_key);

  try {
    const res = await axios.post('https://sandbox.aamarpay.com/jsonpost.php', {
      store_id: config.Store_id,
      signature_key: config.signature_key,
      tran_id: paymentData.transactionId,
      success_url: `http://localhost:5000/api/payment/success?transactionId=${paymentData.transactionId}&status=success`,
      fail_url: `http://localhost:5000/api/payment/success?status=false`,
      cancel_url: 'http://localhost:5173/',
      amount: paymentData.payableAmount,
      currency: 'BDT',

      desc: 'Merchant Registration Payment',
      cus_name: paymentData.CustomerName,
      cus_email: paymentData.CustomerEmail,
      cus_add1: 'N/A',
      cus_add2: 'N/A',
      cus_city: 'N/A',
      cus_state: 'N/A',
      cus_postcode: 'N/A',
      cus_country: 'Bangladesh',
      cus_phone: paymentData.CustomerPhone,
      type: 'json',
    });

    return res.data;
  } catch (error: any) {
    throw new Error('Payment  failed!');
  }
};

export const verifyPayment = async (tnxId: string) => {
  try {
    const response = await axios.get(
      'https://sandbox.aamarpay.com/api/v1/trxcheck/request.php',
      {
        params: {
          store_id: config.Store_id,
          signature_key: config.signature_key,
          type: 'json',
          request_id: tnxId,
        },
      },
    );

    return response.data;
  } catch (err: any) {
    throw new Error('Payment validation failed!');
  }
};
