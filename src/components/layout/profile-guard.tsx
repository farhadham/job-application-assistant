import { Alert } from "@heroui/alert";
import { usePathname } from "next/navigation";

import { incompleteProfileMessage } from "@/data/constants";
import { useUserStore } from "@/stores/user-store";

const ProfileGuard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user } = useUserStore();

  if (pathname !== "/profile" && !user.email)
    return <Alert color="warning" title={incompleteProfileMessage} />;

  return <>{children}</>;
};

export default ProfileGuard;
