import { redirect } from "next/navigation";
import { authApi } from "@/lib/api-app";

export default async function AppIndex() {
  const user = await authApi.me();
  
  if (!user) {
    redirect("/auth");
  }
  
  redirect("/app/dashboard");
}
