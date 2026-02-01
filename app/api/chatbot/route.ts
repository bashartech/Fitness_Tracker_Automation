import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Get the token from the authorization header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Get the message from the request body
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get the chatbot API URL from environment variables
    const CHATBOT_API_URL = 'https://bashartc14-fit-chatbot.hf.space';

    // Forward the request to the chatbot API with the token
    const chatbotResponse = await fetch(`${CHATBOT_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        token
      })
    });

    // Get the response from the chatbot
    const chatbotData = await chatbotResponse.json();

    // Return the chatbot response
    return NextResponse.json(chatbotData, {
      status: chatbotResponse.status
    });
  } catch (error) {
    console.error('Error communicating with chatbot:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to communicate with chatbot',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Export other methods if needed
export async function GET(req: NextRequest) {
  return NextResponse.json(
    { message: 'Chatbot proxy API endpoint' },
    { status: 200 }
  );
}