"use client";
import { useTasks } from "@/context/taskContext";
import { useUserContext } from "@/context/userContext";
import { github, moon, profile } from "@/utils/Icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

function Header() {
  const { user } = useUserContext();
  const { openModalForAdd, activeTasks } = useTasks();

  const router = useRouter();

  const { name } = user;

  const userId = user._id;

  return (
    <header className="px-6 my-4 w-full flex items-center justify-between bg-[#f9f9f9]">
      <div>
        <h1 className="text-lg font-medium">
          {userId ? `Hola, ${name}` : "Bienvenido a TaskManager"}
        </h1>
        <p className="text-sm">
          {userId ? (
            <>
              Tienes{" "}
              <span className="font-bold text-[#3aafae]">
                {activeTasks.length}
              </span>
              &nbsp;tareas activas
            </>
          ) : (
            "Por favor, inicia sesión o regístrate para ver tus tareas"
          )}
        </p>
      </div>
      <div className="h-[50px] flex items-center gap-[10.4rem]">
        <button
          className="px-8 py-3 bg-[#3aafae] text-white rounded-[50px]
          hover:bg-[#00A1F1] hover:text-white transition-all duration-200 ease-in-out"
          onClick={() => {
            if (userId) {
              openModalForAdd();
            } else {
              router.push("/login");
            }
          }}
        >
          {userId ? "Agregar una tarea nueva" : "Inicia sesion o registrate"}
        </button>
      </div>
    </header>
  );
}

export default Header;
