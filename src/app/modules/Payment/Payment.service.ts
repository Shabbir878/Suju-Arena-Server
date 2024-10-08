/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Booking } from '../Booking/booking.model';
import { verifyPayment } from './Payment.utlis';
import { join } from 'path';
import { readFileSync } from 'fs';
const paymentIntoDb = async (payload: any) => {
  const { transactionId, status } = payload;

  const verifyResponse = await verifyPayment(transactionId);
  let message = '';
  // console.log(verifyResponse);
  let result;
  if (verifyResponse && verifyResponse.pay_status === 'Successful') {
    result = await Booking.findOneAndUpdate(
      {
        transactionId: transactionId,
      },
      { isBooked: 'confirmed' },
    );
    message = 'Successfully Paid!';
  } else {
    message = 'Payment Failed!';
  }

  // console.log(result);

  const filePath = join(__dirname, '../../../views/confirmation.html');
  let template = readFileSync(filePath, 'utf-8');

  template = template.replace('{{message}}', message);

  return template;
};

export const paymentService = {
  paymentIntoDb,
};
