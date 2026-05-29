import ChangePaymentPin from "@/components/home/ChangePaymentPin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Payment Pin | Jumpa",
  description: "Change your secure Jumpa wallet transaction and payment pin.",
};

export default function Page() {
  return <ChangePaymentPin />;
}
