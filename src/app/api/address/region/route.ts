import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const accessKey = process.env.NEXT_PUBLIC_FASTRAC_ACCESS_KEY;
    const secretKey = process.env.NEXT_PUBLIC_FASTRAC_SECRET_KEY;

    if (!accessKey || !secretKey) {
        return NextResponse.json({ error: "Missing API credentials" }, { status: 500 });
    }

    try {

        const body = await req.json();
        const { search } = body;

        if (!search) {
            return NextResponse.json({ error: "Missing postal_code in request body" }, { status: 400 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_FASTRAC_URL}/apiRegion/search-region`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access-key': accessKey,
                'secret-key': secretKey
            },
            body: JSON.stringify({ search }),
            cache: 'default'
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("API Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch region" }, { status: 500 });
    }
}