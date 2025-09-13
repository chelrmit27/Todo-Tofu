import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  username: string;
}

export function getAuthUser(request: NextRequest): TokenPayload | null {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header found');
      return null;
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return null;
    }

    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    console.log('Token decoded successfully:', { userId: decoded.userId, username: decoded.username });
    
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function requireAuth(request: NextRequest): TokenPayload {
  const user = getAuthUser(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}
