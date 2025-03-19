import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session?.user?.role !== 'admin') {
      return new NextResponse("Forbidden", { status: 403 }); 
    }

    const formId = parseInt(params.id);

    if (isNaN(formId)) {
      return new NextResponse("Invalid form ID", { status: 400 });
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/forms/${formId}/responses`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching responses: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in form responses route:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
