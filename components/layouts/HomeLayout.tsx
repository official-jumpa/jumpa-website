'use client';

import React, { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import './HomeLayout.css';
import { useRouter, usePathname } from 'next/navigation';

// Components
import TopBar from '@/components/common/TopBar';
import SideDrawer from '@/components/ui/SideDrawer';
import FloatingSupportButton from '@/components/common/FloatingSupportButton';
import WalletListModal from '@/components/modal/WalletListModal';
import WalletDetailsModal from '@/components/modal/WalletDetailsModal';
import VirtualAccountModal from '@/components/modal/VirtualAccountModal';
import DepositMethodSheet from '@/components/modal/DepositMethodSheet';
import PinEntryScreen from '@/components/pin/PinEntryScreen';
import PrivateKeyScreen from '@/components/wallet/PrivateKeyScreen';
import WithdrawOptions from '@/lib/pages/home/withdraw/options';
import TradePage from '@/lib/pages/home/subpages/TradePage';
import DAppPage from '@/lib/pages/home/subpages/DAppPage';
import type { BalancesResponse } from '@/lib/api';
import { getBalances } from '@/lib/api';

// Data
import { type Wallet } from '@/data/wallets';

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
  balances: BalancesResponse | null;
  selectedSymbol: string;
  onSelectAsset: (symbol: string) => void;
  refreshBalances: () => void;
}

const HomeLayoutContext = createContext<HomeLayoutContextType | undefined>(undefined);

export const useHomeLayout = () => {
  const context = useContext(HomeLayoutContext);
  if (!context) throw new Error('useHomeLayout must be used within HomeLayout');
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
    if (!pathname.includes('/home')) {
      setCurrentPage('home');
    }
  }, [pathname]);

  // Home State
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [balances, setBalances] = useState<BalancesResponse | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("ETH");

  const fetchBalances = useCallback(async () => {
    const res = await getBalances();
    if (res.data) {
      setBalances(res.data);
    }
  }, []);

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 90000); // 90s poll
    return () => clearInterval(interval);
  }, [fetchBalances]);

  // Modals
  const [walletListOpen, setWalletListOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [virtualAccountOpen, setVirtualAccountOpen] = useState(false);
  const [depositSheetOpen, setDepositSheetOpen] = useState(false);

  // Security flow
  const [pinScreenOpen, setPinScreenOpen] = useState(false);
  const [pinWallet, setPinWallet] = useState<Wallet | null>(null);
  const [privateKeyOpen, setPrivateKeyOpen] = useState(false);
  const [privateKeyData, setPrivateKeyData] = useState<Wallet | null>(null);

  // Withdrawal
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // Handlers
  const handleNavigate = useCallback((pageId: string) => {
    setCurrentPage(pageId);
    setDrawerOpen(false);
    if (pageId === "home") router.push("/home");
  }, [router]);

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
    onTrade: () => { setCurrentPage("trade"); router.push("/home"); },
    onDApp: () => { setCurrentPage("dapp"); router.push("/home"); },

    onReceive: () => setDepositSheetOpen(true),
    balances,
    selectedSymbol,
    onSelectAsset: (symbol: string) => setSelectedSymbol(symbol),
    refreshBalances: fetchBalances,
  };

  // Check if we should hide the global UI shell (TopBar, etc.)
  const hideShellPaths = ["/savings/onboarding", "/onboarding", "/create-account", "/save-recovery", "/verify-email", "/notifications", "/send", "/home/airtime", "/home/group", "/home/3rikeAi", "/home/savings", "/setup-pin"];
  const shouldHideShell = hideShellPaths.some(p => pathname === p || pathname?.startsWith(p + '/'));

  return (
    <HomeLayoutContext.Provider value={contextValue}>
      <div className="jumpa-theme-wrapper">
        <div className="phone-frame">
          <div className={`app-content ${(walletListOpen || selectedWallet || virtualAccountOpen || depositSheetOpen) ? 'is-blurred' : ''}`}>
            {!shouldHideShell && <TopBar onMenuClick={() => setDrawerOpen(true)} />}
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
          {currentPage === "home" && !shouldHideShell && <FloatingSupportButton />}


          {/* Overlays */}
          <WithdrawOptions isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />

          {pinScreenOpen && (
            <PinEntryScreen
              onSuccess={handlePinSuccess}
              onClose={() => { setPinScreenOpen(false); setPinWallet(null); }}
            />
          )}

          {privateKeyOpen && (
            <div className="fullscreen-overlay">
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
            <div className="overlay" onClick={() => setDrawerOpen(false)} />
          )}

          <SideDrawer
            isOpen={drawerOpen}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onClose={() => setDrawerOpen(false)}
          />

          {(walletListOpen || selectedWallet || virtualAccountOpen || depositSheetOpen) && !drawerOpen && (
            <div className="overlay-blur" onClick={() => {
              setWalletListOpen(false);
              setSelectedWallet(null);
              setVirtualAccountOpen(false);
              setDepositSheetOpen(false);
            }} />
          )}

          {walletListOpen && (
            <WalletListModal
              onClose={() => setWalletListOpen(false)}
            />
          )}

          {selectedWallet && (
            <WalletDetailsModal
              wallet={selectedWallet}
              onClose={() => setSelectedWallet(null)}
              onPrivateKey={handlePrivateKeyRequest}
            />
          )}

          {virtualAccountOpen && (
            <VirtualAccountModal
              onClose={() => setVirtualAccountOpen(false)}
            />
          )}

          {depositSheetOpen && (
            <DepositMethodSheet 
              onClose={() => setDepositSheetOpen(false)} 
              address={balances?.address || ""}
              selectedSymbol={selectedSymbol}
            />
          )}
        </div>
      </div>
    </HomeLayoutContext.Provider>
  );
};

export default HomeLayout;
