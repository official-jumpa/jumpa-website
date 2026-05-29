import Withdraw from "@/components/home/Withdraw";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Withdraw Funds | Jumpa",
  description: "Withdraw your funds securely",
};

export default function Page() {
  return <Withdraw />;
}
