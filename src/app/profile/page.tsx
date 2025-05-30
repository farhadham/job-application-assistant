"use client";

import Statistics from "@/components/profile/statistics";
import { UpdateUserForm } from "@/components/profile/update-user-form";
import { useUserStore } from "@/stores/user-store";

export default function ProfilePage() {
  const { user, isLoaded } = useUserStore();

  return (
    <div className="space-y-20">
      {user.email ? (
        <div className="space-y-4">
          <h1 className="text-2xl font-medium">New jobs</h1>
          <Statistics />
        </div>
      ) : null}
      {isLoaded ? (
        <div className="space-y-4">
          <h1 className="text-2xl font-medium">Profile details</h1>
          <UpdateUserForm user={user} />
        </div>
      ) : null}
    </div>
  );
}
