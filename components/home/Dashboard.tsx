"use client";
import "./HomePage.css";
import "./home.css";
import WalletSelectorCard from "./WalletSelectorCard";
import WalletBalanceCard from "./WalletBalanceCard";
import QuickActionRow from "./QuickActionRow";
import ServiceShortcutGrid from "./ServiceShortcutGrid";
import QuickTransferList from "./QuickTransferList";
import PromoBannerCard from "./PromoBannerCard";
import VirtualAccountBanner from "./VirtualAccountBanner";
import HomeLoanCard from "./HomeLoanCard";
import TransactionListCard from "./TransactionListCard";
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

      {/* <QuickTransferList /> */}
      <PromoBannerCard />
      <VirtualAccountBanner onClick={onVirtualAccount} />
      <TransactionListCard />
      {/* <HomeLoanCard onOpenLoanDetail={() => router.push("/home/loan")} /> */}
      <div className="home-bottom-spacer" />
    </div>
  );
}
