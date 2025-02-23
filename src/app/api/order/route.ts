import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const accessKey = process.env.NEXT_PUBLIC_FASTRAC_ACCESS_KEY;
    const secretKey = process.env.NEXT_PUBLIC_FASTRAC_SECRET_KEY;

    if (!accessKey || !secretKey) {
        return NextResponse.json({ error: "Missing API credentials" }, { status: 500 });
    }

    try {
        const body = await req.json();
        const bodyData = {...body}

        if (!bodyData) {
            return NextResponse.json({ error: "Missing request body" }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: "Order successfully created",
            data: {
              booking_id: "FSTR.CO-20241226DNZH0",
              awb: "FSTRA1321700196758740992",
              expect_pickup_start: "2024-12-27 09:00:00",
              expect_pickup_end: "2024-12-27 12:00:00",
              tariff: 11000,
              insurance: true,
              insurance_detail: {
                insurance_percent: 0.3,
                insurance_minimum: 2500,
                insurance: 2500
              },
              cod: true,
              cod_detail: {
                item_value: 100000,
                cod_fee_percent: 3,
                cod_fee: 5000,
                cod_custom: 0,
                cod_billed: 118500,
                cod_disbursement: 100000
              }
            }
        }, { status: 201 });

    } catch (error) {
        console.error("API Fetch Error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}