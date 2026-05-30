"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function RegistrationToast() {
  useEffect(() => {
    toast.success("Account created! You can now sign in.");
  }, []);

  return null;
}
