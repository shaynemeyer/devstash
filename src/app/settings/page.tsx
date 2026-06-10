import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProfileUser } from "@/lib/db/profile";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { EditorPreferencesForm } from "@/components/settings/EditorPreferencesForm";
import { BillingSection } from "@/components/settings/BillingSection";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;

  const [profileUser, sidebarItemTypes, sidebarCollections, dbUser] = await Promise.all([
    getProfileUser(userId),
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
    db.user.findUnique({ where: { id: userId }, select: { isPro: true } }),
  ]);

  if (!profileUser) redirect("/sign-in");

  const shellUser = {
    name: session.user?.name ?? profileUser.name,
    email: session.user?.email ?? profileUser.email,
    image: session.user?.image ?? null,
  };

  return (
    <DashboardShell itemTypes={sidebarItemTypes} collections={sidebarCollections} user={shellUser} isPro={dbUser?.isPro ?? false}>
      <div className="p-6 max-w-3xl mx-auto space-y-10">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account settings</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
            Billing
          </h2>
          <BillingSection isPro={dbUser?.isPro ?? false} />
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
            Editor preferences
          </h2>
          <EditorPreferencesForm />
        </section>

        {profileUser.hasPassword && (
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
              Change password
            </h2>
            <ChangePasswordForm />
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-destructive border-b border-border pb-2">
            Danger zone
          </h2>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Delete account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently remove your account and all its data.
              </p>
            </div>
            <DeleteAccountDialog />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
