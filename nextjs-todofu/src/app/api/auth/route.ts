export async function GET() {
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
  try {
    return new Response('OK');
  } catch (error) {
    console.error('Error in auth route:', error);
    return new Response('Error', { status: 500 });
  }
}
