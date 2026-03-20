import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import BrandHeader from "@/components/rangers/BrandHeader";
import AppToast from "@/components/rangers/AppToast";
import LoadingScreen from "@/components/rangers/LoadingScreen";
import useSeedData from "@/components/rangers/useSeedData";
import { sortMembers } from "@/components/rangers/utils";
import ProfileIdentityGate from "@/components/rangers/ProfileIdentityGate";
import DeleteAccountCard from "@/components/rangers/DeleteAccountCard";
import { clearStoredMemberProfile, getStoredMemberProfile, saveMemberProfile } from "@/lib/memberProfileSession";

export default function Profile() {
  const seedQuery = useSeedData();
  const queryClient = useQueryClient();
  const [identity, setIdentity] = React.useState(() => getStoredMemberProfile());
  const [toast, setToast] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  const membersQuery = useQuery({
    queryKey: ["members"],
    queryFn: () => base44.entities.Member.list(),
    enabled: seedQuery.isSuccess,
    initialData: [],
  });

  const members = sortMembers(membersQuery.data);
  const activeMember = members.find((member) => member.name === identity?.memberName) || null;

  const handleConfirmIdentity = ({ member, email }) => {
    const nextIdentity = { memberName: member.name, memberEmail: email };
    saveMemberProfile(nextIdentity);
    setIdentity(nextIdentity);
  };

  const handleDelete = async () => {
    if (!identity) return;

    setIsDeleting(true);
    const response = await base44.functions.invoke("deleteAccountData", identity);

    clearStoredMemberProfile();
    setIdentity(null);
    setIsDeleting(false);
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
    queryClient.invalidateQueries({ queryKey: ["submission", identity.memberName] });
    setToast(response.data?.deleted_submissions > 0 ? "Your account data was deleted." : "No saved account data was found.");
  };

  if (seedQuery.isLoading || membersQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (!identity || !activeMember) {
    return <ProfileIdentityGate members={members} onConfirm={handleConfirmIdentity} />;
  }

  return (
    <div>
      <BrandHeader />
      <div className="mx-auto max-w-[680px] px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 rounded-2xl border border-white/[0.06] bg-[#003278] px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.08] text-white">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "2px" }}>
                Profile Settings
              </h1>
              <p className="mt-2 text-[14px] text-white/65">
                Manage your account data for {activeMember.name}.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-white/[0.06] bg-[var(--slate)] p-5 sm:p-6">
          <div className="text-[11px] font-semibold tracking-[2px] text-white/35" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
            Active profile
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full text-[18px] font-bold text-white" style={{ background: activeMember.accent_color }}>
              {activeMember.name[0]}
            </div>
            <div>
              <div className="text-[16px] font-semibold text-white" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
                {activeMember.name}
              </div>
              <div className="text-[13px] text-white/50">{identity.memberEmail}</div>
            </div>
          </div>
        </div>

        <DeleteAccountCard
          member={activeMember}
          memberEmail={identity.memberEmail}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </div>
      <AppToast toast={toast} onClose={() => setToast("")} />
    </div>
  );
}