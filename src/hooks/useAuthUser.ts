"use client";
import { useState, useEffect } from "react";
import { UsuarioGet } from "@/types/usuario/usuario";

export function useAuthUser(): UsuarioGet | null {
  const [user, setUser] = useState<UsuarioGet | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") { // Ensure localStorage is available
      const userDataString = localStorage.getItem("userData");
      if (userDataString) {
        try {
          const userData: UsuarioGet = JSON.parse(userDataString);
          setUser(userData);
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
          setUser(null);
        }
      }
    }
  }, []);

  return user;
}
