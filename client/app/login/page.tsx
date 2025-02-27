"use client";
import React, { useEffect } from "react";
import LoginForm from "../Components/auth/LoginForm/LoginForm";
import { useUserContext } from "@/context/userContext";
import { useRouter } from "next/navigation";

function page() {
  const { user } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página de inicio si el usuario ya ha iniciado sesión
    if (user && user._id) {
      router.push("/");
    }
  }, [user, router]);

  // devuelve null o un spinner/indicator de carga
  if (user && user._id) {
    return null;
  }

  return (
    <div className="auth-page w-full h-full flex justify-center items-center">
      <LoginForm />
    </div>
  );
}

export default page;
