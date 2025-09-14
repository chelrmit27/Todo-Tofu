import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/mongodb';
import { corsResponse, handlePreflight } from '@/lib/cors';
import { UserServices } from '@/services/UserServices';
import { signJWT } from '@/utils/SignHelper';
import { loginSchema } from '@/lib/validation';

interface TokenPayload {
  userId: string;
  username: string;
}

export async function OPTIONS() {
  return handlePreflight();
}

export async function POST(request: NextRequest) {
  try {
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate the request body using Zod schema
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return corsResponse({
        message: 'Validation failed',
        errors: formattedErrors,
      }, 400);
    }

    const { username, password } = validationResult.data;

    const user = await UserServices.findByUserName(username);
    if (!user) {
      return corsResponse({ message: 'Invalid credentials' }, 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return corsResponse({ message: 'Invalid credentials' }, 401);
    }

    const tokenPayload: TokenPayload = {
      userId: user.id.toString(),
      username: user.username,
    };
    const token = signJWT(tokenPayload);

    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
    };

    return corsResponse({ 
      message: 'Login successful', 
      user: userData, 
      token 
    });
    
  } catch (error) {
    console.error('Error in auth login route:', error);
    return corsResponse({ message: 'Internal server error' }, 500);
  }
}
