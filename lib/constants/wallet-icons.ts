export const WALLET_ICONS = {
    // Action Icons
    close: '/assets/icons/actions/close.svg',
    copy: '/assets/icons/actions/copy.svg',
    add: '/assets/icons/actions/add.svg',

    // Chain Icons
    baseChain: '/assets/chains/base.svg',
    stellarChain: '/assets/chains/stellar.png',
    stellarChain2: '/assets/chains/stellar-coin.png',
    solanaChain: '/assets/chains/solana.png',
    solanaChain2: '/assets/chains/solana-2.png',

    // Coin Icons
    solIcon: '/coins/sol.svg',
    ethIcon: '/coins/eth.svg',
    btcIcon: '/coins/btc.svg',
    usdcIcon: '/coins/usdc.svg',
    usdtIcon: '/coins/usdt.svg',
    xlmIcon: '/assets/chains/stellar-coin.png',
} as const;

export function getChainIcon(symbol: string): string {
    const sym = symbol.toUpperCase();
    if (sym.includes('SOL')) return WALLET_ICONS.solanaChain2;
    if (sym.includes('ETH') || sym.includes('BASE')) return WALLET_ICONS.baseChain;
    if (sym.includes('XLM')) return WALLET_ICONS.stellarChain;
    return WALLET_ICONS.baseChain;
}

export function getCoinIcon(symbol: string): string | null {
    const sym = symbol.toUpperCase();
    if (sym.includes('SOL')) return WALLET_ICONS.solIcon;
    if (sym.includes('ETH')) return WALLET_ICONS.ethIcon;
    if (sym.includes('BASE')) return WALLET_ICONS.baseChain;
    if (sym.includes('BTC')) return WALLET_ICONS.btcIcon;
    if (sym.includes('USDC')) return WALLET_ICONS.usdcIcon;
    if (sym.includes('USDT')) return WALLET_ICONS.usdtIcon;
    if (sym.includes('XLM')) return WALLET_ICONS.xlmIcon;
    return null;
}
