export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  enabled: boolean;
}

export const navItems: NavItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: 'home', enabled: true },
  { id: 'dapp', label: 'DApp', path: '/dapp', icon: 'dapp', enabled: true },
  { id: 'trade', label: 'Trade', path: '/trade', icon: 'trade', enabled: true },
];
