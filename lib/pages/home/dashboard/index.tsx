"use client"
import "../HomePage.css";
import "../home.css";
import WalletSelectorCard from "../components/WalletSelectorCard";
import WalletBalanceCard from "../components/WalletBalanceCard";
import QuickActionRow from "../components/QuickActionRow";
import ServiceShortcutGrid from "../components/ServiceShortcutGrid";
import QuickTransferList from "../components/QuickTransferList";
import PromoBannerCard from "../components/PromoBannerCard";
import VirtualAccountBanner from "../components/VirtualAccountBanner";
import HomeLoanCard from "../components/HomeLoanCard";
import { useHomeLayout } from "@/components/layouts/HomeLayout";
import { useRouter } from "next/navigation";

export default function JumpaDashboard() {
  const router = useRouter();

  const {
    balanceHidden,
    onToggleBalance,
    onWalletDropdown,
    onVirtualAccount,
    onWithdrawal,
    onTrade,
    onDApp,
    onReceive,
  } = useHomeLayout();


  return (
    <div className="home-page">
      <WalletSelectorCard onDropdown={onWalletDropdown} />
      <WalletBalanceCard hidden={balanceHidden} onToggle={onToggleBalance} />
      <QuickActionRow
        onSend={() => router.push("/send")}
        onReceive={onReceive}
        onSwap={onTrade}
      />
      <ServiceShortcutGrid onWithdraw={onWithdrawal} onDApp={onDApp} />

      <QuickTransferList />
      <PromoBannerCard />
      <VirtualAccountBanner onClick={onVirtualAccount} />
      <HomeLoanCard onOpenLoanDetail={() => router.push("/home/loan")} />
      <div className="home-bottom-spacer" />
    </div>
  );
}
