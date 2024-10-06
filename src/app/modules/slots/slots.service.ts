/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { Facility } from '../Facility/facility.model';
import { TSlots } from './slots.interface';
import { Slot } from './slots.model';
import { Booking } from '../Booking/booking.model';
import {
  convertTimeTo12HourFormat,
  format24Hour,
} from '../Booking/booking.utlis';

const facilityOpenTime = '06:00 AM';
const facilityCloseTime = '10:00 PM';

const createSlotsIntoDb = async (payload: TSlots) => {
  const isFacility = await Facility.findById(payload.facility);

  if (!isFacility) {
    throw new AppError(httpStatus.NOT_FOUND, 'Facility Not Found');
  }

  const date = payload.date;
  const facility = payload.facility;
  const isSlots = await Slot.find({ date: date, facility: facility });

  // Check if any slots have the same date as the payload
  if (isSlots.length > 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'SLOTS ALREADY EXIST');
  }

  const slots = [
    { startTime: '08:00', endTime: '10:00' },
    { startTime: '10:00', endTime: '12:00' },
    { startTime: '12:00', endTime: '14:00' },
    { startTime: '14:00', endTime: '16:00' },
    { startTime: '16:00', endTime: '18:00' },
    { startTime: '18:00', endTime: '20:00' },
  ];

  // Generate slots for the specified facility and date
  const slotDocuments = slots.map((slot) => ({
    date: payload.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    facility: payload.facility,
  }));

  // Save the slots to the database
  const createdSlots = await Slot.insertMany(slotDocuments);

  return createdSlots;
};

const availableSlotsIntoDb = async (payload: any) => {
  const { date, facility } = payload;

  // Use current date if no date is provided
  const selectedDate = date || new Date().toISOString().split('T')[0];

  // Retrieve bookings with 'confirmed' status for the specified date and facility
  const bookings = await Booking.find({
    facility: facility,
    date: selectedDate,
    isBooked: 'confirmed',
  });

  let availableSlots: { startTime: string; endTime: string }[] = [];
  let currentStartTime = format24Hour(facilityOpenTime);

  // Sort bookings by start time
  const sortedBookings = bookings.sort(
    (a, b) => format24Hour(a.startTime) - format24Hour(b.startTime),
  );

  // If no bookings exist, the whole day is available
  if (sortedBookings.length === 0) {
    availableSlots.push({
      startTime: facilityOpenTime,
      endTime: facilityCloseTime,
    });
  } else {
    sortedBookings.forEach((booking) => {
      const bookingStartTime = format24Hour(booking.startTime);
      const bookingEndTime = format24Hour(booking.endTime);

      // If there is a gap between the current available time and the booking start time
      if (currentStartTime < bookingStartTime) {
        availableSlots.push({
          startTime: convertTimeTo12HourFormat(currentStartTime.toString()), // Convert to string
          endTime: convertTimeTo12HourFormat(bookingStartTime.toString()), // Convert to string
        });
      }

      // Update the currentStartTime to the end of the current booking
      currentStartTime = bookingEndTime;
    });

    const facilityEndTime = format24Hour(facilityCloseTime);
    // Add any remaining time after the last booking until facility closing
    if (currentStartTime < facilityEndTime) {
      availableSlots.push({
        startTime: convertTimeTo12HourFormat(currentStartTime.toString()), // Convert to string
        endTime: convertTimeTo12HourFormat(facilityEndTime.toString()), // Convert to string
      });
    }
  }

  return availableSlots;
};

export const SlotsService = {
  createSlotsIntoDb,
  availableSlotsIntoDb,
};
