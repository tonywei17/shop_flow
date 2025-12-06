import { DashboardHeader } from "@/components/dashboard/header";
import { ProfileClient } from "./profile-client";

export default function ProfilePage() {
  return (
    <>
      <DashboardHeader
        title="マイプロフィール"
        breadcrumbs={[
          { label: "ホーム", href: "/" },
          { label: "マイプロフィール" },
        ]}
        showHelpIcon={false}
      />
      <div className="px-9 py-6">
        <ProfileClient />
      </div>
    </>
  );
}
