import { v4 as uuidv4 } from "uuid";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
    try {
        const { name, imageUrl } = await req.json();
        const profile = await currentProfile();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const server = await db.server.create({
            data: {
                userId: profile.id,
                name,
                imageUrl,
                inviteCode: uuidv4(),
                channels: {
                    create: [
                        {
                            name: "general",
                            userId: profile.id,
                        },
                    ],
                },
                members: {
                    create: [
                        {
                            userId: profile.id,
                            role: Role.ADMIN,
                        },
                    ],
                },
            },
        });
        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVER POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
