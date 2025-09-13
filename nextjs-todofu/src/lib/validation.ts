import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const userRegistrationSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  email: z.string().email('Invalid email format'),
  name: z.string().optional(),
  profilePicture: z.string().optional(),
});

// Reminder validation function
export const validateReminderInput = (data: {
  title: string;
  date: string;
  time: string;
  description?: string;
}) => {
  if (!data.title || data.title.trim() === '') {
    throw new Error('Title is required');
  }
  if (!data.date || data.date.trim() === '') {
    throw new Error('Date is required');
  }
  if (!data.time || data.time.trim() === '') {
    throw new Error('Time is required');
  }
};

// Ownership validation function
export const validateOwnership = (
  resourceUserId: string,
  requestUserId: string
) => {
  if (resourceUserId !== requestUserId) {
    throw new Error('Unauthorized: You do not own this resource');
  }
};
