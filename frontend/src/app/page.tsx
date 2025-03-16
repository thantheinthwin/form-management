'use client'

import { useSession } from "next-auth/react";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null; // Or a loading spinner component
  }

  if (session) {
    redirect("/dashboard");
  }

  redirect("/login");
}
