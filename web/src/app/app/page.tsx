import { redirect } from "next/navigation";

export default async function AppIndex() {
  redirect("/app/dashboard");
}
