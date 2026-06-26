"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

// Components
import TopBar from "@/components/common/TopBar";
import SideDrawer from "@/components/ui/SideDrawer";
import FloatingSupportButton from "@/components/common/FloatingSupportButton";
import WalletListModal from "@/components/modal/WalletListModal";
import WalletDetailsModal from "@/components/modal/WalletDetailsModal";
import VirtualAccountModal from "@/components/modal/VirtualAccountModal";
import DepositMethodSheet from "@/components/modal/DepositMethodSheet";
import PinEntryScreen from "@/components/pin/PinEntryScreen";
import PrivateKeyScreen from "@/components/wallet/PrivateKeyScreen";
import WithdrawOptions from "@/components/home/WithdrawOptions";
import TradePage from "@/components/home/TradePage";
import DAppPage from "@/components/home/DAppPage";
import SendMethodSheet from "@/features/send/components/send-method-sheet";
import type { BalancesResponse, UserWallet } from "@/lib/api";
import { getBalances, getWallets, selectWallet, renameWallet } from "@/lib/api";

// Data
import { type Wallet } from "@/data/wallets";

interface HomeLayoutContextType {
  balanceHidden: boolean;
  onToggleBalance: () => void;
  onOpenMenu: () => void;
  onWalletDropdown: () => void;
  onVirtualAccount: () => void;
  onWithdrawal: () => void;
  onTrade: () => void;
  onDApp: () => void;
  onReceive: () => void;
  sendMethodOpen: boolean;
  onSendMethodClick: () => void;
  onCloseSendMethod: () => void;
  balances: BalancesResponse | null;
  selectedSymbol: string;
  onSelectAsset: (symbol: string) => void;
  refreshBalances: () => void;
  wallets: UserWallet[];
  activeWallet: UserWallet | null;
  onSelectWallet: (address: string) => Promise<void>;
  onRenameWallet: (address: string, name: string) => Promise<boolean>;
  refreshWallets: () => void;
}

const HomeLayoutContext = createContext<HomeLayoutContextType | undefined>(
  undefined,
);

export const useHomeLayout = () => {
  const context = useContext(HomeLayoutContext);
  if (!context) throw new Error("useHomeLayout must be used within HomeLayout");
  return context;
};

interface HomeLayoutProps {
  children?: ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Navigation & Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");

  // Reset currentPage to 'home' when navigating to sub-routes
  useEffect(() => {
    if (!pathname.includes("/home")) {
      setCurrentPage("home");
    }
  }, [pathname]);

  // Home State
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [balances, setBalances] = useState<BalancesResponse | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("ETH");
  const [wallets, setWallets] = useState<UserWallet[]>([]);

  const activeWallet = wallets.find(w => w.isSelected) || wallets[0] || null;

  useEffect(() => {
    const saved = localStorage.getItem("jumpa-selected-symbol");
    if (saved) {
      setSelectedSymbol(saved);
    }
  }, []);

  const fetchBalances = useCallback(async () => {
    const res = await getBalances();
    console.log("[HomeLayout] getBalances() result:", res);
    if (res.data) {
      setBalances(res.data);
    }
    return res;
  }, []);

  const fetchWallets = useCallback(async () => {
    const res = await getWallets();
    if (res.data) {
      setWallets(res.data);
    }
    return res;
  }, []);

  const handleSelectWallet = useCallback(async (address: string) => {
    console.log("[HomeLayout] Selecting wallet address:", address);
    const res = await selectWallet(address);
    if (!res.error) {
      await fetchWallets();
    }
  }, [fetchWallets]);

  const handleRenameWallet = useCallback(async (address: string, name: string) => {
    console.log("[HomeLayout] Renaming wallet:", address, "to:", name);
    const res = await renameWallet(address, name);
    if (!res.error) {
      await fetchWallets();
      return true;
    }
    return false;
  }, [fetchWallets]);

  // Load wallets on mount with retry logic (up to 3 times)
  useEffect(() => {
    const skipLoad = [
      "/onboarding",
      "/verify-email",
      "/create-account",
      "/save-recovery",
      "/setup-pin",
    ].some((p) => pathname === p || pathname?.startsWith(p + "/"));

    if (skipLoad) {
      console.log("[HomeLayout] On onboarding/auth path. Skipping fetchWallets.");
      return;
    }

    let active = true;
    let retryCount = 0;
    let timer: NodeJS.Timeout;

    async function run() {
      console.log(`[HomeLayout] Running fetchWallets, attempt ${retryCount + 1}...`);
      const res = await fetchWallets();
      if (!active) return;
      if (!res.data && retryCount < 3) {
        retryCount++;
        console.warn(`[HomeLayout] fetchWallets failed. Retrying (${retryCount}/3) in 5s...`);
        timer = setTimeout(run, 5000);
      }
    }

    run();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [fetchWallets, pathname]);

  // Fetch balances reactively when active wallet changes, with 3 retry attempts
  useEffect(() => {
    console.log("[HomeLayout] activeWallet address changed:", activeWallet?.address);
    if (!activeWallet?.address) {
      console.log("[HomeLayout] No activeWallet address. Skipping balances fetch.");
      return;
    }

    const skipLoad = [
      "/onboarding",
      "/verify-email",
      "/create-account",
      "/save-recovery",
      "/setup-pin",
    ].some((p) => pathname === p || pathname?.startsWith(p + "/"));

    if (skipLoad) {
      console.log("[HomeLayout] On onboarding/auth path. Skipping fetchBalances.");
      return;
    }

    let active = true;
    let retryCount = 0;
    let timer: NodeJS.Timeout;

    async function run() {
      console.log(`[HomeLayout] Running fetchBalances for address ${activeWallet.address}, attempt ${retryCount + 1}...`);
      const res = await fetchBalances();
      if (!active) return;
      if (!res.data && retryCount < 3) {
        retryCount++;
        console.warn(`[HomeLayout] fetchBalances failed. Retrying (${retryCount}/3) in 5s...`);
        timer = setTimeout(run, 5000);
      }
    }

    run();
    const interval = setInterval(run, 90000); // 90s poll

    return () => {
      active = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [activeWallet?.address, fetchBalances, pathname]);

  // Modals
  const [walletListOpen, setWalletListOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [virtualAccountOpen, setVirtualAccountOpen] = useState(false);
  const [depositSheetOpen, setDepositSheetOpen] = useState(false);
  const [sendMethodOpen, setSendMethodOpen] = useState(false);

  // Security flow
  const [pinScreenOpen, setPinScreenOpen] = useState(false);
  const [pinWallet, setPinWallet] = useState<Wallet | null>(null);
  const [privateKeyOpen, setPrivateKeyOpen] = useState(false);
  const [privateKeyData, setPrivateKeyData] = useState<Wallet | null>(null);

  // Withdrawal
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // Handlers
  const handleNavigate = useCallback(
    (pageId: string) => {
      setCurrentPage(pageId);
      setDrawerOpen(false);
      if (pageId === "home") router.push("/home");
    },
    [router],
  );

  const handlePrivateKeyRequest = useCallback((wallet: Wallet) => {
    setPinWallet(wallet);
    setSelectedWallet(null);
    setPinScreenOpen(true);
  }, []);

  const handlePinSuccess = useCallback(() => {
    setPinScreenOpen(false);
    setPrivateKeyData(pinWallet);
    setPrivateKeyOpen(true);
  }, [pinWallet]);

  const contextValue: HomeLayoutContextType = {
    balanceHidden,
    onToggleBalance: () => setBalanceHidden(!balanceHidden),
    onOpenMenu: () => setDrawerOpen(true),
    onWalletDropdown: () => setWalletListOpen(true),
    onVirtualAccount: () => setVirtualAccountOpen(true),
    onWithdrawal: () => setWithdrawOpen(true),
    onTrade: () => {
      setCurrentPage("trade");
      router.push("/home");
    },
    onDApp: () => {
      setCurrentPage("dapp");
      router.push("/home");
    },

    onReceive: () => setDepositSheetOpen(true),
    sendMethodOpen,
    onSendMethodClick: () => setSendMethodOpen(true),
    onCloseSendMethod: () => setSendMethodOpen(false),
    balances,
    selectedSymbol,
    onSelectAsset: (symbol: string) => {
      setSelectedSymbol(symbol);
      localStorage.setItem("jumpa-selected-symbol", symbol);
    },
    refreshBalances: fetchBalances,
    wallets,
    activeWallet,
    onSelectWallet: handleSelectWallet,
    onRenameWallet: handleRenameWallet,
    refreshWallets: fetchWallets,
  };

  // Check if we should hide the global UI shell (TopBar, etc.)
  const hideShellPaths = [
    "/savings/onboarding",
    "/onboarding",
    "/create-account",
    "/save-recovery",
    "/verify-email",
    "/notifications",
    "/send",
    "/home/airtime",
    "/home/group",
    "/home/3rikeAi",
    "/home/savings",
    "/setup-pin",
    "/group/chat",
    "/chat",
  ];
  const shouldHideShell = hideShellPaths.some(
    (p) => pathname === p || pathname?.startsWith(p + "/"),
  );

  return (
    <HomeLayoutContext.Provider value={contextValue}>
      <div className="flex justify-center items-center min-h-screen bg-black font-sans text-[#f3f3f5]">
        <div className="w-full max-w-[450px] h-screen h-[100dvh] bg-[#171717] relative overflow-hidden mx-auto shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div
            className={`h-full overflow-y-auto overflow-x-hidden scrollbar-none transition-[filter] duration-250 ease-out ${walletListOpen || selectedWallet || virtualAccountOpen || depositSheetOpen || sendMethodOpen ? "blur-md" : ""}`}
          >
            {!shouldHideShell && (
              <TopBar onMenuClick={() => setDrawerOpen(true)} />
            )}
            {currentPage === "home" ? (
              children
            ) : currentPage === "trade" ? (
              <TradePage />
            ) : currentPage === "dapp" ? (
              <DAppPage />
            ) : (
              children
            )}
          </div>
          {currentPage === "home" && !shouldHideShell && (
            <FloatingSupportButton />
          )}

          {/* Overlays */}
          <WithdrawOptions
            isOpen={withdrawOpen}
            onClose={() => setWithdrawOpen(false)}
          />

          {pinScreenOpen && (
            <PinEntryScreen
              onSuccess={handlePinSuccess}
              onClose={() => {
                setPinScreenOpen(false);
                setPinWallet(null);
              }}
            />
          )}

          {privateKeyOpen && (
            <div className="fixed inset-0 bg-black z-100">
              <PrivateKeyScreen
                wallet={privateKeyData}
                onDone={() => {
                  setPrivateKeyOpen(false);
                  setPrivateKeyData(null);
                  setPinWallet(null);
                }}
              />
            </div>
          )}

          {drawerOpen && (
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setDrawerOpen(false)} />
          )}

          <SideDrawer
            isOpen={drawerOpen}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onClose={() => setDrawerOpen(false)}
          />

          {(walletListOpen ||
            selectedWallet ||
            virtualAccountOpen ||
            sendMethodOpen ||
            depositSheetOpen) &&
            !drawerOpen && (
              <div
                className="absolute inset-0 bg-black/45 backdrop-blur-[10px] z-55"
                onClick={() => {
                  setWalletListOpen(false);
                  setSelectedWallet(null);
                  setVirtualAccountOpen(false);
                  setSendMethodOpen(false);
                  setDepositSheetOpen(false);
                }}
              />
            )}

          {walletListOpen && (
            <WalletListModal onClose={() => setWalletListOpen(false)} />
          )}
          {selectedWallet && (
            <WalletDetailsModal
              wallet={selectedWallet}
              onClose={() => setSelectedWallet(null)}
              onPrivateKey={handlePrivateKeyRequest}
            />
          )}

          {virtualAccountOpen && (
            <VirtualAccountModal onClose={() => setVirtualAccountOpen(false)} />
          )}

          {depositSheetOpen && (
            <DepositMethodSheet
              onClose={() => setDepositSheetOpen(false)}
              address={balances?.address || ""}
              selectedSymbol={selectedSymbol}
            />
          )}

          {sendMethodOpen && (
            <SendMethodSheet
              open={sendMethodOpen}
              onOpenChange={setSendMethodOpen}
            />
          )}
        </div>
      </div>
    </HomeLayoutContext.Provider>
  );
};

export default HomeLayout;
