import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { courier_code: string } }) {
    const accessKey = process.env.NEXT_PUBLIC_FASTRAC_ACCESS_KEY;
    const secretKey = process.env.NEXT_PUBLIC_FASTRAC_SECRET_KEY;

    if (!accessKey || !secretKey) {
        return NextResponse.json({ error: "Missing API credentials" }, { status: 500 });
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_FASTRAC_URL}/apiCourier/courier-service?courier_code=${ params.courier_code }`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'access-key': accessKey,
                'secret-key': secretKey
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
        return NextResponse.json({ error: "Failed to fetch courier service" }, { status: 500 });
    }
}