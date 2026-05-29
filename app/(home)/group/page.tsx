import GroupFlow from "@/components/home/GroupFlow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Group Trade | Jumpa",
  description: "Pool funds, assign traders, and automatically split profits",
};

export default function Page() {
  return <GroupFlow />;
}
