"use client";
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
    onSendMethodClick,
  } = useHomeLayout();

  return (
    <div className="px-6 flex flex-col gap-[6px]">
      <WalletSelectorCard onDropdown={onWalletDropdown} />
      <WalletBalanceCard hidden={balanceHidden} onToggle={onToggleBalance} />
      <QuickActionRow
        onSend={onSendMethodClick}
        onReceive={onReceive}
        onSwap={onTrade}
      />
      <ServiceShortcutGrid onWithdraw={onWithdrawal} onDApp={onDApp} />

      {/* <QuickTransferList /> */}
      <PromoBannerCard />
      <VirtualAccountBanner onClick={onVirtualAccount} />
      <TransactionListCard />
      {/* <HomeLoanCard onOpenLoanDetail={() => router.push("/home/loan")} /> */}
      <div className="h-20" />
    </div>
  );
}
