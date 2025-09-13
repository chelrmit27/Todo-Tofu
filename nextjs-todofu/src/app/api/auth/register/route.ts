import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/mongodb';
import { corsResponse, handlePreflight } from '@/lib/cors';
import { UserModel, IUser } from '@/models/UserModel';
import { UserServices } from '@/services/UserServices';
import { signJWT } from '@/utils/SignHelper';
import { userRegistrationSchema } from '@/lib/validation';

interface TokenPayload {
  userId: string;
  username: string;
}

export async function OPTIONS() {
  return handlePreflight();
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    console.log('Register endpoint hit');
    
    // Validate the request body using Zod schema
    const validationResult = userRegistrationSchema.safeParse(body);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      console.log('Error validating');

      return corsResponse({
        message: 'Validation failed',
        errors: formattedErrors,
      }, 400);
    }

    const { username, email, password, name, profilePicture } =
      validationResult.data;

    // Check if username already exists
    const existingUser = await UserServices.usernameExists(username);
    if (existingUser) {
      return corsResponse({ message: 'Username already exists' }, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user: IUser = new UserModel({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashedPassword,
      name: name?.trim(),
      profilePicture,
      preferences: {
        timezone: 'Asia/Ho_Chi_Minh',
        dailyBudgetMin: 720,
        theme: 'system',
      },
    });

    console.log('user:', user);

    await user.save();

    const tokenPayload: TokenPayload = {
      userId: user.id.toString(),
      username: user.username,
    };

    const token = signJWT(tokenPayload);

    return corsResponse({
      message: 'Customer registered successfully',
      customer: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
      },
      token,
    }, 201);
    
  } catch (error: unknown) {
    console.error('User Registration Error:', error);
    return corsResponse({ message: 'Internal server error' }, 500);
  }
}
