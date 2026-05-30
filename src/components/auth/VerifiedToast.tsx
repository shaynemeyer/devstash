"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function VerifiedToast() {
  useEffect(() => {
    toast.success("Email verified! You can now sign in.");
  }, []);

  return null;
}
