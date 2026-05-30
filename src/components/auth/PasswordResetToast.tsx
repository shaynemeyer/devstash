"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function PasswordResetToast() {
  useEffect(() => {
    toast.success("Password updated! You can now sign in.");
  }, []);

  return null;
}
