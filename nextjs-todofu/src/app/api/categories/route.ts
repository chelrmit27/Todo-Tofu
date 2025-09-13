import { NextRequest } from 'next/server';
import { corsResponse } from '@/lib/cors';
import { getAuthUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { CategoryModel } from '@/models/CategoryModel';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthUser(request);
    if (!user) {
      return corsResponse({ message: 'Unauthorized' }, 401);
    }

    // Connect to database
    await connectToDatabase();

    // Get categories for the user
    const categories = await CategoryModel.find({
      userId: user.userId
    });

    return corsResponse(categories, 200);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return corsResponse({ message: 'Internal server error' }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthUser(request);
    if (!user) {
      return corsResponse({ message: 'Unauthorized' }, 401);
    }

    // Connect to database
    await connectToDatabase();

    const body = await request.json();
    const { name, color } = body;

    if (!name || !color) {
      return corsResponse({ message: 'Name and color are required' }, 400);
    }

    // Create new category
    const category = new CategoryModel({
      name,
      color,
      userId: user.userId
    });

    const savedCategory = await category.save();
    return corsResponse(savedCategory, 201);
  } catch (error) {
    console.error('Error creating category:', error);
    return corsResponse({ message: 'Internal server error' }, 500);
  }
}

export async function OPTIONS() {
  return corsResponse({}, 200);
}
