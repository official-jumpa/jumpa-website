import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Flow = "home" | "bank-token" | "bank-send" | "bank-confirm" | "bank-pin" | "bank-processing" | "bank-success"
  | "crypto-token" | "crypto-recipient" | "crypto-send" | "crypto-confirm" | "crypto-pin" | "crypto-processing" | "crypto-success";

type PinState = "empty" | "filling" | "incorrect" | "correct";

// ─── Data ─────────────────────────────────────────────────────────────────────
const BANK_TOKENS = [
  { symbol: "ETH", name: "Eth", balance: "0.0192", icon: "🔷", color: "#627EEA" },
  { symbol: "SOL", name: "Solana", balance: "0.0192", icon: "◎", color: "#9945FF" },
  { symbol: "BTC", name: "Btc", balance: "0.0192", icon: "₿", color: "#F7931A" },
  { symbol: "USDC", name: "USDC", balance: "0.00", icon: "💲", color: "#2775CA" },
  { symbol: "USDT", name: "USDT", balance: "0.0192", icon: "₮", color: "#26A17B" },
  { symbol: "CELO", name: "Celo", balance: "0.00", icon: "🟡", color: "#FBCC5C" },
  { symbol: "LSK", name: "Lisk", balance: "0.00", icon: "🔺", color: "#0D4EA6" },
];

const CRYPTO_TOKENS = [
  { symbol: "ETH", name: "Eth", balance: "0.0192", icon: "🔷", color: "#627EEA" },
  { symbol: "SOL", name: "Solana", balance: "0.0192", icon: "◎", color: "#9945FF" },
  { symbol: "BTC", name: "Btc", balance: "0.0192", icon: "₿", color: "#F7931A" },
  { symbol: "AMA", name: "AMa", balance: "0.0192", icon: "🟩", color: "#00C853" },
  { symbol: "USDC", name: "USDC", balance: "0.00", icon: "💲", color: "#2775CA" },
  { symbol: "FLOW", name: "Flow", balance: "0.00", icon: "🟢", color: "#00EF8B" },
  { symbol: "USDT", name: "USDT", balance: "0.0192", icon: "₮", color: "#26A17B" },
  { symbol: "CELO", name: "Celo", balance: "0.00", icon: "🟡", color: "#FBCC5C" },
  { symbol: "LSK", name: "Lisk", balance: "0.00", icon: "🔺", color: "#0D4EA6" },
];

const VALID_ACCOUNT = "916941953";
const VALID_WALLET = "7EcDhSYGxXyszYEp35KHN8vvw3svAuLKTzXwCFLtV";

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  screen: {
    width: "100%", height: "100%", background: "#0E0E14",
    display: "flex", flexDirection: "column" as const,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#fff",
    overflow: "hidden",
  },
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px", borderBottom: "1px solid #1E1E2A", flexShrink: 0,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: "50%", border: "none",
    background: "#1A1A24", cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  pill: {
    padding: "6px 14px", borderRadius: 20, border: "1px solid #2A2A3A",
    background: "#1A1A24", color: "#CCCCDD", fontSize: 13, cursor: "pointer",
    display: "flex", alignItems: "center", gap: 6,
  },
  card: {
    background: "#16161F", borderRadius: 16, padding: "16px",
    border: "1px solid #1E1E2A",
  },
  input: {
    width: "100%", background: "#1A1A24", border: "1px solid #2A2A3A",
    borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14,
    outline: "none", fontFamily: "inherit",
  },
  purpleBtn: {
    width: "100%", padding: "16px", borderRadius: 14, border: "none",
    background: "#7B5CF5", color: "#fff", fontSize: 16, fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit",
  },
  numKey: {
    flex: 1, padding: "16px 0", background: "#1A1A24", border: "none",
    borderRadius: 10, color: "#fff", fontSize: 18, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit", textAlign: "center" as const,
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavBar({ screens, current, onGo }: { screens: [Flow, string][], current: Flow, onGo: (f: Flow) => void }) {
  return (
    <div style={{ display: "flex", gap: 4, padding: "8px 12px", overflowX: "auto", background: "#0A0A0F", flexShrink: 0, borderBottom: "1px solid #1E1E2A" }}>
      {screens.map(([f, label]) => (
        <button key={f} onClick={() => onGo(f)} style={{
          padding: "5px 10px", borderRadius: 16, border: "none", whiteSpace: "nowrap",
          background: current === f ? "#7B5CF5" : "#1A1A24",
          color: current === f ? "#fff" : "#8888AA", fontSize: 11, cursor: "pointer", fontFamily: "inherit",
        }}>{label}</button>
      ))}
    </div>
  );
}

function TokenRow({ token, onSelect }: { token: typeof BANK_TOKENS[0], onSelect: () => void }) {
  return (
    <div onClick={onSelect} style={{
      display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
      background: "#16161F", borderRadius: 12, cursor: "pointer", marginBottom: 6,
      border: "1px solid #1E1E2A",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%", background: token.color + "22",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
      }}>{token.icon}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{token.name}</div>
        <div style={{ color: "#8888AA", fontSize: 12 }}>{token.balance} {token.symbol}</div>
      </div>
    </div>
  );
}

function Numpad({ onKey }: { onKey: (k: string) => void }) {
  const keys = ["1","2","3","4","5","6","7","8","9",".","0","←"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 16px 16px" }}>
      {keys.map(k => (
        <button key={k} onClick={() => onKey(k)} style={S.numKey}>{k}</button>
      ))}
    </div>
  );
}

function PinBox({ state }: { state: PinState }) {
  const dots = state === "filling" ? 3 : state === "incorrect" || state === "correct" ? 4 : 0;
  const borderColor = state === "incorrect" ? "#EF4444" : state === "correct" ? "#22C55E" : "#2A2A3A";
  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          width: 56, height: 56, borderRadius: 12, border: `2px solid ${borderColor}`,
          background: "#1A1A24", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {i < dots && <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff" }} />}
        </div>
      ))}
    </div>
  );
}

function SuccessScreen({ isCrypto, onDone }: { isCrypto: boolean, onDone: () => void }) {
  return (
    <div style={{
      ...S.screen, justifyContent: "center", alignItems: "center", padding: 20,
      background: "radial-gradient(ellipse at top, #1A1A2E 0%, #0E0E14 60%)",
    }}>
      <div style={{
        background: "#0A0A10", borderRadius: 24, padding: "28px 24px",
        width: "100%", maxWidth: 380, border: "1px solid #1E1E2A", position: "relative",
        overflow: "hidden",
      }}>
        {/* Confetti dots */}
        {["#FF4F4F","#FFD700","#00E5FF","#FF69B4","#7B5CF5","#00FF88","#FF8C00"].map((c,i) => (
          <div key={i} style={{
            position: "absolute", width: 8, height: 16, background: c,
            borderRadius: 2, top: `${5 + (i*8)}%`, left: `${8 + (i*12)}%`,
            transform: `rotate(${i*30}deg)`, opacity: 0.8,
          }} />
        ))}
        <button onClick={onDone} style={{
          position: "absolute", top: 12, right: 12, width: 28, height: 28,
          borderRadius: "50%", border: "none", background: "#1A1A24",
          color: "#8888AA", cursor: "pointer", fontSize: 16,
        }}>×</button>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", background: "#22C55E",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <h3 style={{ textAlign: "center", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Transaction Successful</h3>
        <p style={{ textAlign: "center", color: "#8888AA", fontSize: 13, marginBottom: 20 }}>
          {isCrypto ? "You've sent 1 sol to 756...BYz9" : "You've sent N1.00 to 91679078"}
        </p>

        <div style={{ borderTop: "1px solid #1E1E2A", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            ["Amount", isCrypto ? "$1.00" : "$1.00"],
            isCrypto ? ["Date", "20-2-2026"] : ["Bank", "Opay"],
            isCrypto ? ["Hash Tnx", "6146c...6d994"] : ["Date", "20-2-2026"],
          ].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8888AA", fontSize: 14 }}>{label}</span>
              <span style={{ fontSize: 14, color: label === "Hash Tnx" ? "#7B5CF5" : "#fff" }}>{val}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button style={{ ...S.purpleBtn, flex: 1 }}>Receipt</button>
          <button style={{ ...S.purpleBtn, flex: 1, background: "transparent", border: "1px solid #7B5CF5", color: "#7B5CF5" }}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Send() {
  const [flow, setFlow] = useState<Flow>("home");
  const [_selectedToken, setSelectedToken] = useState(BANK_TOKENS[0]);
  const [tokenSearch, setTokenSearch] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("0");
  const [walletAddress, setWalletAddress] = useState("");
  const [pinState, setPinState] = useState<PinState>("empty");

  const isCrypto = flow.startsWith("crypto");

  const handleNumKey = (k: string) => {
    if (k === "←") { setAmount(a => a.length > 1 ? a.slice(0,-1) : "0"); return; }
    if (k === "." && amount.includes(".")) return;
    setAmount(a => a === "0" && k !== "." ? k : a + k);
  };

  const accountValid = accountNumber === VALID_ACCOUNT;
  const accountError = accountNumber.length >= 9 && !accountValid;
  const walletValid = walletAddress === VALID_WALLET;
  const walletError = walletAddress.length > 5 && !walletValid;
  const insufficient = parseFloat(amount) > 81.07;

  const ALL_SCREENS: [Flow, string][] = [
    ["home","Home"],
    ["bank-token","Bank Token"],
    ["bank-send","Bank Send"],
    ["bank-confirm","Bank Confirm"],
    ["bank-pin","Bank PIN"],
    ["bank-processing","Processing"],
    ["bank-success","Bank ✅"],
    ["crypto-token","Crypto Token"],
    ["crypto-recipient","Recipient"],
    ["crypto-send","Crypto Send"],
    ["crypto-confirm","Crypto Confirm"],
    ["crypto-pin","Crypto PIN"],
    ["crypto-processing","Processing"],
    ["crypto-success","Crypto ✅"],
  ];

  const tokens = isCrypto ? CRYPTO_TOKENS : BANK_TOKENS;
  const filteredTokens = tokens.filter(t =>
    t.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
    t.symbol.toLowerCase().includes(tokenSearch.toLowerCase())
  );

  // ── Render screens ──────────────────────────────────────────────────────────

  const renderScreen = () => {
    // SUCCESS
    if (flow === "bank-success" || flow === "crypto-success") {
      return <SuccessScreen isCrypto={flow === "crypto-success"} onDone={() => setFlow("home")} />;
    }

    // PROCESSING
    if (flow === "bank-processing" || flow === "crypto-processing") {
      return (
        <div style={{ ...S.screen, justifyContent: "center", alignItems: "center" }}>
          <div style={{
            background: "#16161F", borderRadius: 24, padding: "32px 24px",
            width: "90%", maxWidth: 380, border: "1px solid #1E1E2A",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <span style={{ color: "#8888AA", fontSize: 14 }}>You Pay</span>
              <button style={{ background: "none", border: "none", color: "#8888AA", cursor: "pointer", fontSize: 20 }}>×</button>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>1.00</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <span style={{ background: "#1A1A24", padding: "4px 12px", borderRadius: 20, fontSize: 13 }}>Naira</span>
              <span style={{ color: "#8888AA", fontSize: 13 }}>20000.00 Naira</span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#7B5CF522", border: "2px solid #7B5CF5", display: "flex", alignItems: "center", justifyContent: "center" }}>↕</div>
            </div>
            <div style={{ ...S.card, marginBottom: 20 }}>
              <div style={{ color: "#8888AA", fontSize: 12, marginBottom: 8 }}>To:</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#7B5CF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                <div>
                  <div style={{ fontWeight: 600 }}>Anita</div>
                  <div style={{ color: "#8888AA", fontSize: 12 }}>916945667</div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                </div>
              </div>
            </div>
            {[["Amount","N1.00"],["Bank","Opay"],["Fee","0.1 USDC"]].map(([l,v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1E1E2A" }}>
                <span style={{ color: "#8888AA", fontSize: 14 }}>{l}</span>
                <span style={{ fontSize: 14 }}>{v}</span>
              </div>
            ))}
            <button style={{ ...S.purpleBtn, marginTop: 20, background: "#7B5CF588", cursor: "not-allowed" }}>Processing...</button>
          </div>
        </div>
      );
    }

    // PIN screens
    if (flow === "bank-pin" || flow === "crypto-pin") {
      return (
        <div style={{ ...S.screen, justifyContent: "flex-end" }}>
          <div style={{ background: "#13131C", borderRadius: "24px 24px 0 0", padding: "24px 20px 32px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "#2A2A3A" }} />
            </div>
            <button onClick={() => setFlow(isCrypto ? "crypto-confirm" : "bank-confirm")} style={{
              width: 32, height: 32, borderRadius: "50%", border: "none",
              background: "#1A1A24", color: "#fff", cursor: "pointer", marginBottom: 20, fontSize: 16,
            }}>×</button>
            <h3 style={{ textAlign: "center", fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Enter your pin</h3>
            <PinBox state={pinState} />
            {pinState === "incorrect" && (
              <p style={{ textAlign: "center", color: "#EF4444", fontSize: 13, marginBottom: 12 }}>Incorrect passcode</p>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "#8888AA", fontSize: 12 }}>Jumpa Secure Numeric Keypad</span>
              <button onClick={() => {
                if (pinState === "filling") {
                  setPinState("correct");
                  setTimeout(() => { setFlow(isCrypto ? "crypto-processing" : "bank-processing"); setPinState("empty"); }, 800);
                }
              }} style={{ background: "none", border: "none", color: "#7B5CF5", cursor: "pointer", fontSize: 13 }}>Done</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {["1","2","3","4","5","6","7","8","9","0","x"].map(k => (
                <button key={k} onClick={() => {
                  if (k === "x") { setPinState("empty"); return; }
                  setPinState(p => p === "empty" ? "filling" : p === "filling" ? "incorrect" : "empty");
                }} style={{ ...S.numKey, padding: "14px 0" }}>{k}</button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // BANK CONFIRM
    if (flow === "bank-confirm") {
      return (
        <div style={{ ...S.screen, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <div style={{ background: "#16161F", borderRadius: 24, padding: "24px", width: "100%", maxWidth: 380, border: "1px solid #1E1E2A", position: "relative" }}>
            <button onClick={() => setFlow("bank-send")} style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28, borderRadius: "50%", border: "none", background: "#1A1A24", color: "#8888AA", cursor: "pointer", fontSize: 18 }}>×</button>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>Confirm transaction</h3>
            <div style={{ ...S.card, marginBottom: 12 }}>
              <div style={{ color: "#8888AA", fontSize: 12, marginBottom: 4 }}>You Pay</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 32, fontWeight: 800 }}>1.00</span>
                <span style={{ background: "#1A1A24", padding: "4px 12px", borderRadius: 20, fontSize: 13 }}>Naira</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#7B5CF522", border: "2px solid #7B5CF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>↕</div>
            </div>
            <div style={{ ...S.card, marginBottom: 20 }}>
              <div style={{ color: "#8888AA", fontSize: 12, marginBottom: 8 }}>To:</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#7B5CF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                <div>
                  <div style={{ fontWeight: 600 }}>Anita</div>
                  <div style={{ color: "#8888AA", fontSize: 12 }}>916945667</div>
                </div>
                <div style={{ marginLeft: "auto", width: 24, height: 24, borderRadius: "50%", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
            </div>
            {[["Amount","N1.00"],["Bank","Opay"],["Fee","0.1 USDC"]].map(([l,v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1E1E2A" }}>
                <span style={{ color: "#8888AA", fontSize: 14 }}>{l}</span>
                <span style={{ fontSize: 14 }}>{v}</span>
              </div>
            ))}
            <button onClick={() => { setPinState("empty"); setFlow("bank-pin"); }} style={{ ...S.purpleBtn, marginTop: 20 }}>Make payment</button>
          </div>
        </div>
      );
    }

    // CRYPTO CONFIRM
    if (flow === "crypto-confirm") {
      return (
        <div style={{ ...S.screen, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <div style={{ background: "#16161F", borderRadius: 24, padding: "24px", width: "100%", maxWidth: 380, border: "1px solid #1E1E2A", position: "relative" }}>
            <button onClick={() => setFlow("crypto-send")} style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28, borderRadius: "50%", border: "none", background: "#1A1A24", color: "#8888AA", cursor: "pointer", fontSize: 18 }}>×</button>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>Confirm transaction</h3>
            <div style={{ ...S.card, marginBottom: 12 }}>
              <div style={{ color: "#8888AA", fontSize: 12, marginBottom: 4 }}>You Pay</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 32, fontWeight: 800 }}>1.00</span>
                <div>
                  <span style={{ background: "#1A1A24", padding: "4px 12px", borderRadius: 20, fontSize: 13 }}>ETh</span>
                  <div style={{ color: "#8888AA", fontSize: 11, textAlign: "right", marginTop: 2 }}>1 ETh</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#7B5CF522", border: "2px solid #7B5CF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>↕</div>
            </div>
            <div style={{ ...S.card, marginBottom: 20 }}>
              <div style={{ color: "#8888AA", fontSize: 12, marginBottom: 8 }}>To:</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#8888AA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                <div>
                  <div style={{ fontWeight: 600 }}>0xG...Umz</div>
                  <div style={{ color: "#8888AA", fontSize: 11 }}>0x71C...C7ab88</div>
                </div>
                <div style={{ marginLeft: "auto", width: 24, height: 24, borderRadius: "50%", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
            </div>
            {[["Network","Ethereum"],["Network fee","$0.023"]].map(([l,v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1E1E2A" }}>
                <span style={{ color: "#8888AA", fontSize: 14 }}>{l}</span>
                <span style={{ fontSize: 14 }}>{v}</span>
              </div>
            ))}
            <button onClick={() => { setPinState("empty"); setFlow("crypto-pin"); }} style={{ ...S.purpleBtn, marginTop: 20 }}>Make payment</button>
          </div>
        </div>
      );
    }

    // BANK SEND
    if (flow === "bank-send") {
      return (
        <div style={S.screen}>
          <div style={S.topBar}>
            <button onClick={() => setFlow("bank-token")} style={S.backBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Send Money</span>
            <button style={S.pill}>Naira <span style={{ fontSize: 10 }}>▼</span></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "#8888AA", fontSize: 12, marginBottom: 8 }}>Recipient Account</div>
              <input
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="Account number"
                style={{
                  ...S.input,
                  borderColor: accountError ? "#EF4444" : accountValid ? "#22C55E" : "#2A2A3A",
                }}
              />
              {accountValid && (
                <div style={{ marginTop: 6, background: "#22C55E22", border: "1px solid #22C55E", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#22C55E" }}>
                  Price Anita Ndukwe
                </div>
              )}
              {accountError && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>Wrong account number</div>}
            </div>

            <div style={{ ...S.card, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <button style={{ ...S.pill, fontSize: 12 }}>
                  <span style={{ fontSize: 14 }}>🔷</span> 0xB7...BYz9 <span style={{ fontSize: 10 }}>▼</span>
                </button>
              </div>
              <div style={{ textAlign: "center", fontSize: 40, fontWeight: 800, marginBottom: 4 }}>{amount}</div>
              <div style={{ textAlign: "center", color: "#8888AA", fontSize: 14, marginBottom: 4 }}>$81.07</div>
              <div style={{ textAlign: "center", color: insufficient ? "#EF4444" : "#22C55E", fontSize: 12 }}>
                {insufficient ? "Insufficient balance" : amount !== "0" ? "Available ✎" : "Enter amount ✎"}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["₦50","₦200","₦100","Max"].map(q => (
                <button key={q} style={{ flex: 1, padding: "8px 0", background: "#1A1A24", border: "1px solid #2A2A3A", borderRadius: 20, color: "#CCCCDD", fontSize: 12, cursor: "pointer" }}>{q}</button>
              ))}
            </div>
          </div>

          <Numpad onKey={handleNumKey} />
          <div style={{ padding: "0 16px 20px" }}>
            {insufficient
              ? <button style={{ ...S.purpleBtn, background: "#1A1A24", color: "#EF4444", border: "1px solid #EF444422" }}>Insufficient Funds</button>
              : <button onClick={() => setFlow("bank-confirm")} style={S.purpleBtn}>Send</button>
            }
          </div>
        </div>
      );
    }

    // CRYPTO RECIPIENT
    if (flow === "crypto-recipient") {
      return (
        <div style={{ ...S.screen, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <div style={{ background: "#16161F", borderRadius: 24, padding: "24px", width: "100%", maxWidth: 380, border: "1px solid #1E1E2A", position: "relative" }}>
            <button onClick={() => setFlow("crypto-token")} style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28, borderRadius: "50%", border: "none", background: "#1A1A24", color: "#8888AA", cursor: "pointer", fontSize: 18 }}>×</button>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>Choose recipient</h3>

            <div style={{ position: "relative", marginBottom: 16 }}>
              <textarea
                value={walletAddress}
                onChange={e => setWalletAddress(e.target.value)}
                placeholder="Address or .Tag handle&#10;Enter wallet address or .tag handle"
                rows={3}
                style={{
                  ...S.input,
                  resize: "none",
                  borderColor: walletError ? "#EF4444" : walletValid ? "#2A2A3A" : "#2A2A3A",
                  lineHeight: 1.5,
                }}
              />
              {walletAddress.length > 0 && (
                <button onClick={() => setWalletAddress("")} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: "#8888AA", cursor: "pointer", fontSize: 16 }}>×</button>
              )}
              {walletError && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>Invalid address</div>}
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: walletValid ? 20 : 0 }}>
              <button onClick={() => setFlow("crypto-send")} style={{ ...S.purpleBtn, flex: 1 }}>Continue</button>
              <button style={{ flex: 1, padding: "14px", borderRadius: 14, border: "1px solid #2A2A3A", background: "#1A1A24", color: "#CCCCDD", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                Paste 📋
              </button>
            </div>

            {walletValid && (
              <div style={{ marginTop: 16 }}>
                <div style={{ color: "#8888AA", fontSize: 13, marginBottom: 10 }}>Contact</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#1A1A24", borderRadius: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#7B5CF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Anita</div>
                    <div style={{ color: "#8888AA", fontSize: 12 }}>0xU12...87</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // CRYPTO SEND
    if (flow === "crypto-send") {
      return (
        <div style={S.screen}>
          <div style={S.topBar}>
            <button onClick={() => setFlow("crypto-recipient")} style={S.backBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Send Money</span>
            <button style={S.pill}>ETH <span style={{ fontSize: 10 }}>▼</span></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            <div style={{ ...S.card, marginBottom: 12 }}>
              <div style={{ color: "#8888AA", fontSize: 12, marginBottom: 4 }}>To:</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#8888AA" }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>0xBG...URs</div>
                  <div style={{ color: "#8888AA", fontSize: 11 }}>7bd...hfgg8jfhcnncbbc.ncnc</div>
                </div>
              </div>
            </div>

            <div style={{ ...S.card, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <button style={{ ...S.pill, fontSize: 12 }}>
                  <span style={{ fontSize: 14 }}>🔷</span> 0xB7...BYz9 <span style={{ fontSize: 10 }}>▼</span>
                </button>
              </div>
              <div style={{ textAlign: "center", fontSize: 40, fontWeight: 800, marginBottom: 4 }}>{amount}</div>
              <div style={{ textAlign: "center", color: "#8888AA", fontSize: 14, marginBottom: 4 }}>$81.07</div>
              <div style={{ textAlign: "center", color: insufficient ? "#EF4444" : "#22C55E", fontSize: 12 }}>
                {insufficient ? "Insufficient balance ✎" : amount !== "0" ? "Available ✎" : "Enter amount ✎"}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["₦50","₦200","₦100","Max"].map(q => (
                <button key={q} style={{ flex: 1, padding: "8px 0", background: "#1A1A24", border: "1px solid #2A2A3A", borderRadius: 20, color: "#CCCCDD", fontSize: 12, cursor: "pointer" }}>{q}</button>
              ))}
            </div>
          </div>

          <Numpad onKey={handleNumKey} />
          <div style={{ padding: "0 16px 20px" }}>
            {insufficient
              ? <button style={{ ...S.purpleBtn, background: "#1A1A24", color: "#EF4444", border: "1px solid #EF444422" }}>Insufficient Funds</button>
              : <button onClick={() => setFlow("crypto-confirm")} style={S.purpleBtn}>Review</button>
            }
          </div>
        </div>
      );
    }

    // TOKEN SELECT (bank or crypto)
    if (flow === "bank-token" || flow === "crypto-token") {
      return (
        <div style={{ ...S.screen, justifyContent: "flex-end" }}>
          <div style={{ background: "#13131C", borderRadius: "24px 24px 0 0", padding: "20px 16px 32px", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Search Token</h3>
              <button onClick={() => setFlow("home")} style={{ background: "none", border: "1px solid #2A2A3A", borderRadius: "50%", width: 28, height: 28, color: "#8888AA", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8888AA" }}>🔍</span>
              <input
                value={tokenSearch}
                onChange={e => setTokenSearch(e.target.value)}
                placeholder="Search here"
                style={{ ...S.input, paddingLeft: 36 }}
              />
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filteredTokens.map(t => (
                <TokenRow key={t.symbol} token={t} onSelect={() => {
                  setSelectedToken(t);
                  setAmount("0");
                  setFlow(flow === "bank-token" ? "bank-send" : "crypto-recipient");
                }} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    // HOME
    return (
      <div style={{ ...S.screen, justifyContent: "center", alignItems: "center" }}>
        <div style={{ background: "#16161F", borderRadius: 24, padding: "32px 24px", width: "90%", maxWidth: 340, border: "1px solid #1E1E2A", position: "relative" }}>
          <button style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28, borderRadius: "50%", border: "none", background: "#1A1A24", color: "#8888AA", cursor: "pointer", fontSize: 18 }}>×</button>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#7B5CF522", border: "2px solid #7B5CF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>➤</div>
          </div>
          <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Send</h2>
          <p style={{ textAlign: "center", color: "#8888AA", fontSize: 13, marginBottom: 24 }}>Choose a method below to add funds to your account.</p>

          <button onClick={() => { setTokenSearch(""); setFlow("bank-token"); }} style={{
            width: "100%", padding: "14px 16px", background: "#1A1A24", border: "1px solid #2A2A3A",
            borderRadius: 12, color: "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 10, fontFamily: "inherit",
          }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Bank Transfer</div>
              <div style={{ color: "#8888AA", fontSize: 12 }}>Deposit from your bank account.</div>
            </div>
            <span style={{ color: "#8888AA" }}>›</span>
          </button>

          <button onClick={() => { setTokenSearch(""); setFlow("crypto-token"); }} style={{
            width: "100%", padding: "14px 16px", background: "#1A1A24", border: "1px solid #2A2A3A",
            borderRadius: 12, color: "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between",
            alignItems: "center", fontFamily: "inherit",
          }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Crypto</div>
              <div style={{ color: "#8888AA", fontSize: 12 }}>Receive crypto coins.</div>
            </div>
            <span style={{ color: "#8888AA" }}>›</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0A0A0F", display: "flex", flexDirection: "column", fontFamily: "'DM Sans','Segoe UI',sans-serif", overflow: "hidden" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 4px } ::-webkit-scrollbar-thumb { background: #2A2A3A; border-radius: 2px }`}</style>
      <NavBar screens={ALL_SCREENS} current={flow} onGo={setFlow} />
      <div style={{ flex: 1, overflow: "hidden" }}>
        {renderScreen()}
      </div>
    </div>
  );
}
