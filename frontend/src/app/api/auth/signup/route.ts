import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, role } = body;

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log('Mock Signup:', { name, email, role });

        return NextResponse.json(
            { message: 'User created successfully', userId: 'mock-user-id' },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
