import { siteConfig } from "@/config/site";
import ProfileClient from "./profile-client";

export const metadata = {
  title: `Profile ✦ ${siteConfig.name}`,
  description: "Manage your account and view your debate performance statistics.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
