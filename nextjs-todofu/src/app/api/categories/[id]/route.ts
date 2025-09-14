import { NextRequest } from 'next/server';
import { corsResponse } from '@/lib/cors';
import { getAuthUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { CategoryModel } from '@/models/CategoryModel';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return corsResponse({ message: 'Unauthorized' }, 401);
    }
    await connectToDatabase();
    const body = await request.json();
    const updatedCategory = await CategoryModel.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { $set: body },
      { new: true }
    );
    if (!updatedCategory) {
      return corsResponse({ message: 'Category not found' }, 404);
    }
    return corsResponse(updatedCategory, 200);
  } catch (error) {
    console.error('Error updating category:', error);
    return corsResponse({ message: 'Internal server error' }, 500);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return corsResponse({ message: 'Unauthorized' }, 401);
    }
    await connectToDatabase();
    const deletedCategory = await CategoryModel.findOneAndDelete({
      _id: id,
      userId: user.userId,
    });
    if (!deletedCategory) {
      return corsResponse({ message: 'Category not found' }, 404);
    }
    return corsResponse({ message: 'Category deleted successfully' }, 200);
  } catch (error) {
    console.error('Error deleting category:', error);
    return corsResponse({ message: 'Internal server error' }, 500);
  }
}

export async function OPTIONS() {
  return corsResponse({}, 200);
}

console.log('MONGODB_URI:', process.env.MONGODB_URI);
