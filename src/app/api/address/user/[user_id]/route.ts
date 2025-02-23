import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { user_id: string } }) {

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}address/mainAddress/${ params.user_id }`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'default'
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("API Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch user address" }, { status: 500 });
    }
}