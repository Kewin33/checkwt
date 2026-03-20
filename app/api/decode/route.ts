import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
    token: z.string().min(1),
});

export async function POST(request: NextRequest) {

    let json;

    try {
        json = await request.json();
    } catch {
        return new NextResponse(null, { status: 400 });
    }

    const result = schema.safeParse(json);

    if (!result.success) {
        return new NextResponse(null, { status: 400 });
    }

    const { token } = result.data;

    return NextResponse.json(
        {
            header: {
                test: "yes",
                token
            },
            payload: {
                test: "yes"
            },
            signatureValid: true,
        },
        { status: 200 }
    );
}