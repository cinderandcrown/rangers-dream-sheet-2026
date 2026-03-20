import React from "react";
import { Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DeleteAccountCard({ member, memberEmail, onDelete, isDeleting }) {
  return (
    <div className="rounded-2xl border border-[rgba(192,17,31,0.2)] bg-[rgba(192,17,31,0.06)] p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(192,17,31,0.16)] text-[var(--red)]">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
            Delete Account
          </h2>
          <p className="mt-1 text-[13px] text-white/65">
            This permanently removes the personal data saved for {member.name} in this app.
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-white/[0.08] bg-black/10 px-4 py-4 text-[13px] text-white/70">
        <div><span className="text-white/40">Profile:</span> {member.name}</div>
        <div className="mt-1"><span className="text-white/40">Email:</span> {memberEmail}</div>
        <div className="mt-3 text-white/50">Deletes your saved ranking submission and stored profile data for this app.</div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full justify-center gap-2 rounded-xl bg-[var(--red)] text-white hover:bg-[var(--red)]/90">
            <Trash2 className="h-4 w-4" />
            Delete My Account Data
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-white/[0.08] bg-[var(--slate)] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account data?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This cannot be undone. Your saved profile data and ranking submission for this app will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[0.08] bg-transparent text-white hover:bg-white/[0.06] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={isDeleting}
              className="bg-[var(--red)] text-white hover:bg-[var(--red)]/90"
            >
              {isDeleting ? "Deleting..." : "Yes, delete it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}