import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://dontvibecode.uc.r.appspot.com/';
    
    const response = await fetch(`${apiUrl}api/chat/conversations/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', response.status, errorText);
      return NextResponse.json(
        { error: `External API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying conversation request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

