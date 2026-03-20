import { NextRequest, NextResponse } from "next/server";
import {getKeyById} from "@/app/api/keys/[keyId]/util.ts";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ keyId: string }> }
) {
    const { keyId } = await params;

    // Schlüssel abrufen
    const key = getKeyById(keyId);

    if (!key) {
        return NextResponse.json(
            { error: "Key not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({ key });
}