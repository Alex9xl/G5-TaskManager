"use cleint";
import { useUserContext } from "@/context/userContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useRedirect = (redirect: string) => {
  const { user, loading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!user || !user.email) {
      router.push(redirect);
    }

    // Estar atento a los cambios de user, redirect, router
  }, [user, redirect, router]);
};

export default useRedirect;
