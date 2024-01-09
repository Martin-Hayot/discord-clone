import { ChatHeader } from "@/components/chat/chat-header";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface MemberIdPageProps {
    params: {
        memberId: string;
        serverId: string;
    };
}

const MemberIdPage = async ({ params }: MemberIdPageProps) => {
    const profile = await currentProfile();

    if (!profile) return redirectToSignIn();

    const currentMember = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            userId: profile.id,
        },
        include: {
            user: true,
        },
    });

    if (!currentMember) {
        return null;
    }

    const conversation = await getOrCreateConversation(
        currentMember.id,
        params.memberId
    );

    if (!conversation) {
        return redirect("/");
    }

    const { memberOne, memberTwo } = conversation;

    const otherMember = memberOne.userId === profile.id ? memberTwo : memberOne;

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                type="conversations"
                serverId={params.serverId}
                imageUrl={otherMember.user.imageUrl}
                name={otherMember.user.name}
            />
        </div>
    );
};

export default MemberIdPage;
