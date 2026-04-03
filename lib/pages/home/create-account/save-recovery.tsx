"use client"
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { generatePhrase } from "@/lib/api";
import { useNavigate, useLocation } from "@/lib/pages-adapter";
import { cn } from "@/lib/utils";

function readStoredNavAction(): string | undefined {
    if (typeof window === "undefined") return undefined;
    try {
        const raw = sessionStorage.getItem("jumpa_nav_state");
        if (!raw) return undefined;
        const parsed = JSON.parse(raw) as { action?: string };
        return parsed?.action;
    } catch {
        return undefined;
    }
}

// Indices of the words to hide in the confirmation step (0-based)
const MISSING_INDICES = [2, 5, 9];

const NOT_SUPPORTED_IMPORT_MSG =
    "24-word and private key import will be available soon.";

function normalizeHexKey(raw: string): string {
    const t = raw.trim();
    if (t.startsWith("0x") || t.startsWith("0X")) return t.slice(2);
    return t;
}

function isLikelyWordPhrase(raw: string): boolean {
    const t = raw.trim();
    return /\s/.test(t) || t.split(/\s+/).filter(Boolean).length > 1;
}

function parseWordCount(raw: string): number {
    return raw.trim().split(/\s+/).filter(Boolean).length;
}

function isHexOnly(s: string): boolean {
    return /^[0-9a-fA-F]+$/.test(s);
}

/** Enables Import button styling: 12/24 words, or 32/64 hex (optional 0x). */
function canEnableImport(raw: string): boolean {
    const t = raw.trim();
    if (!t) return false;
    if (isLikelyWordPhrase(t)) {
        const n = parseWordCount(t);
        return n === 12 || n === 24;
    }
    const hex = normalizeHexKey(t);
    if (!isHexOnly(hex)) return false;
    return hex.length === 32 || hex.length === 64;
}

export default function SaveRecoveryPhrase() {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = useSearchParams();
    const flow = searchParams.get("flow");

    const isImport = useMemo(() => {
        if (flow === "create") return false;
        if (flow === "import") return true;
        const fromState = location.state?.action ?? readStoredNavAction();
        return fromState === "import";
    }, [flow, location.state]);


    const [step, setStep] = useState<1 | 2>(1);
    const [isRevealed, setIsRevealed] = useState(false);
    const [phraseConfirmError, setPhraseConfirmError] = useState<string | null>(null);

    // Create flow state
    const [phraseWords, setPhraseWords] = useState<string[]>([]);
    const [loadingPhrase, setLoadingPhrase] = useState(!isImport);
    const [phraseError, setPhraseError] = useState<string | null>(null);

    // Import flow state
    const [importInput, setImportInput] = useState("");
    const [importError, setImportError] = useState<string | null>(null);
    const [importFocused, setImportFocused] = useState(false);

    // Drag and drop state
    const [bankWords, setBankWords] = useState<string[]>([]);
    const [filledSlots, setFilledSlots] = useState<Record<number, string | null>>({});

    // Determine if Step 2 is fully filled out
    const isStep2Complete = MISSING_INDICES.every((index) => filledSlots[index] !== null);

    // --- Fetch phrase on mount (create flow only) ---
    useEffect(() => {
        if (isImport) {
            return;
        }

        let cancelled = false; // prevents StrictMode double-invoke race

        generatePhrase()
            .then((res) => {
                if (cancelled) {
                    return;
                }
                if (res.error || !res.data) {
                    setPhraseError(res.error ?? "Failed to generate phrase");
                    return;
                }

                const words = res.data.phrase.split(" ");
                setPhraseWords(words);

                const missing = MISSING_INDICES.map((i) => words[i]);
                setBankWords([...missing].sort(() => Math.random() - 0.5));
                setFilledSlots(Object.fromEntries(MISSING_INDICES.map((i) => [i, null])));
            })
            .finally(() => {
                if (!cancelled) setLoadingPhrase(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isImport]);

    const handleContinue = () => {
        if (step === 1 && isRevealed) {
            setPhraseConfirmError(null);
            setStep(2);
        } else if (step === 2 && isStep2Complete) {
            const allCorrect = MISSING_INDICES.every(
                (index) => filledSlots[index] === phraseWords[index]
            );

            if (!allCorrect) {
                setPhraseConfirmError(
                    "Those words don't match your recovery phrase. Re-check the empty positions and try again."
                );
                return;
            }

            setPhraseConfirmError(null);
            const phrase = phraseWords.join(" ");
            navigate("/create-account", { state: { phrase, action: "create" } });
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setPhraseConfirmError(null);
            setStep(1);
        } else {
            navigate(-1);
        }
    };

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent, word: string, sourceIndex: number | null = null) => {
        e.dataTransfer.setData("word", word);
        if (sourceIndex !== null) {
            e.dataTransfer.setData("sourceIndex", sourceIndex.toString());
        }
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        setPhraseConfirmError(null);
        const word = e.dataTransfer.getData("word");
        const sourceIndexRaw = e.dataTransfer.getData("sourceIndex");
        const sourceIndex = sourceIndexRaw ? parseInt(sourceIndexRaw) : null;

        if (!word) return;

        setFilledSlots((prev) => {
            const newSlots = { ...prev };
            const existingWordInSlot = newSlots[targetIndex];
            newSlots[targetIndex] = word;

            setBankWords((prevBank) => {
                let newBank = [...prevBank];
                if (sourceIndex === null) {
                    newBank = newBank.filter((w) => w !== word);
                }
                if (existingWordInSlot) {
                    newBank.push(existingWordInSlot);
                }
                return newBank;
            });

            if (sourceIndex !== null && sourceIndex !== targetIndex) {
                newSlots[sourceIndex] = null;
            }

            return newSlots;
        });
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    const handleRemoveFromSlot = (index: number, word: string) => {
        setPhraseConfirmError(null);
        setFilledSlots((prev) => ({ ...prev, [index]: null }));
        setBankWords((prev) => [...prev, word]);
    };

    const handleSelectWord = (word: string) => {
        setPhraseConfirmError(null);
        // Find the first empty slot among missing indices
        const firstEmptyIndex = MISSING_INDICES.find((idx) => filledSlots[idx] === null);
        if (firstEmptyIndex === undefined) return;

        setFilledSlots((prev) => ({ ...prev, [firstEmptyIndex]: word }));
        setBankWords((prev) => prev.filter((w) => w !== word));
    };

    // --- Import mode: validate and navigate (12-word only until backend supports more) ---
    const importReady = canEnableImport(importInput);

    const handleImportSubmit = () => {
        if (!importReady) return;
        const t = importInput.trim();

        if (isLikelyWordPhrase(t)) {
            const words = t.split(/\s+/).filter(Boolean);
            if (words.length === 12) {
                setImportError(null);
                navigate("/create-account", {
                    state: { phrase: words.join(" "), action: "import" },
                });
                return;
            }
            if (words.length === 24) {
                setImportError(NOT_SUPPORTED_IMPORT_MSG);
                return;
            }
        }

        const hex = normalizeHexKey(t);
        if (isHexOnly(hex) && (hex.length === 32 || hex.length === 64)) {
            setImportError(NOT_SUPPORTED_IMPORT_MSG);
        }
    };

    // --- Import mode render ---
    if (isImport) {
        const fieldActive = importFocused || importInput.length > 0;

        return (
            <div
                className="fixed inset-0 flex h-dvh w-full flex-col bg-[#050505] text-white"
                style={{ fontFamily: "Geist, sans-serif" }}
            >
                <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-4 pt-10">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-8 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#18181A] transition-colors hover:bg-[#262626]"
                        aria-label="Back"
                    >
                        <ArrowLeft className="h-5 w-5 text-white/70" />
                    </button>

                    <h1 className="mb-3 text-[32px] font-semibold leading-[145%] tracking-normal text-white">
                        Enter your Secret{" "}
                        <span className="whitespace-nowrap">Phrase or keys</span>
                    </h1>
                    <p className="mb-0 text-base font-normal leading-[145%] tracking-[-0.02em] text-[#DFDFDF]">
                        Use spaces between words if using a
                        <br />
                        recovery phrase.
                    </p>

                    <div className="mt-[80px] w-full">
                        <label htmlFor="import-secret-input" className="sr-only">
                            Recovery phrase or private key
                        </label>
                        <div
                            className={cn(
                                "box-border flex h-[50px] w-[331px] max-w-full flex-row items-center justify-between rounded-lg border border-solid px-4 py-[10px] transition-[border-color]",
                                fieldActive
                                    ? "border-[#6A59CE]"
                                    : "border-[#AAAAAA]",
                            )}
                        >
                            <input
                                id="import-secret-input"
                                autoComplete="off"
                                spellCheck={false}
                                value={importInput}
                                onChange={(e) => {
                                    setImportInput(e.target.value);
                                    setImportError(null);
                                }}
                                onFocus={() => setImportFocused(true)}
                                onBlur={() => setImportFocused(false)}
                                placeholder="Recovery a private key/ pharse"
                                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-normal leading-5 tracking-normal text-[#5A5A5A] outline-none placeholder:text-[#5A5A5A]"
                                style={{
                                    WebkitTextSecurity:
                                        importInput.length > 0 ? "disc" : "none",
                                }}
                            />
                        </div>
                        {importError ? (
                            <p
                                className="mt-3 max-w-[331px] text-center text-sm leading-relaxed text-red-400"
                                role="alert"
                            >
                                {importError}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="mx-auto w-full max-w-md shrink-0 px-6 pb-8 pt-4">
                    <button
                        type="button"
                        onClick={handleImportSubmit}
                        disabled={!importReady}
                        className={cn(
                            "h-12 w-full max-w-[342px] rounded-[10px] px-2.5 text-base font-normal leading-[145%] transition-colors",
                            "text-[#F4F4F4]",
                            importReady
                                ? "bg-[#6A59CE] hover:bg-[#5c4ec0]"
                                : "cursor-not-allowed bg-[#C3BDEB]",
                        )}
                    >
                        Import
                    </button>
                </div>
            </div>
        );
    }

    // --- Create mode: Loading / Error States ---
    if (loadingPhrase) {
        return (
            <div className="fixed inset-0 bg-[#050505] text-white flex items-center justify-center">
                <p className="text-[#A1A1AA] text-sm animate-pulse">Generating your seed phrase...</p>
            </div>
        );
    }

    if (phraseError) {
        return (
            <div className="fixed inset-0 bg-[#050505] text-white flex flex-col items-center justify-center gap-4 px-6">
                <p className="text-red-400 text-sm text-center">{phraseError}</p>
                <Button onClick={() => window.location.reload()} className="bg-[#8B5CF6] text-white">
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 w-full h-dvh bg-[#050505] text-white flex flex-col px-6 py-12">
            <div className="flex-1 flex flex-col mt-2 w-full max-w-md mx-auto">

                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="w-10 h-10 rounded-full bg-[#18181A] flex items-center justify-center mb-6 hover:bg-[#262626] transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-white/70" />
                </button>

                <h1 className="text-3xl font-bold tracking-tight mb-4 leading-snug">
                    {step === 1 ? (
                        <>Save your Secret<br />Recovery Phrase</>
                    ) : (
                        <>Confirm your Secret<br />Recovery Phrase</>
                    )}
                </h1>

                <p className="text-[#A1A1AA] text-[15px] leading-relaxed mb-8">
                    {step === 1 ? (
                        <>
                            This is your <span className="text-[#8B5CF6]">Secret Recovery Phrase</span>. Write
                            it down in the correct order and keep it safe. If someone has your Secret Recovery
                            Phrase, they can access your wallet. Don't share it with anyone, ever.
                        </>
                    ) : (
                        "Click to select and drag the missing words in the correct order."
                    )}
                </p>

                {/* Phrase Container */}
                <div className="w-full bg-[#141414] rounded-xl p-4 border border-[#262626] relative overflow-hidden">

                    {/* STEP 1: View Phrase Grid */}
                    {step === 1 && (
                        <>
                            <div className={`grid grid-cols-3 gap-2 transition-all duration-300 ${!isRevealed ? "blur-md select-none opacity-50" : "blur-0 opacity-100"}`}>
                                {phraseWords.map((word, index) => (
                                    <div key={index} className="bg-black border border-[#262626] rounded-lg px-2 py-2.5 text-[13px] font-medium flex items-center">
                                        <span className="text-white/50 w-4 mr-1">{index + 1}.</span> {word}
                                    </div>
                                ))}
                            </div>

                            {!isRevealed && (
                                <div
                                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10 bg-[A7A3A3]/30 backdrop-blur-[1px]"
                                    onClick={() => {
                                        setIsRevealed(true);
                                    }}
                                >
                                    <img src="/eye_lid.svg" alt="" />
                                    <span className="font-semibold text-sm mb-1 text-white">Tap to reveal</span>
                                    <span className="text-xs text-white/60">Make sure no one is watching with you</span>
                                </div>
                            )}
                        </>
                    )}

                    {/* STEP 2: Confirm Phrase Grid */}
                    {step === 2 && (
                        <div className="grid grid-cols-3 gap-2">
                            {phraseWords.map((_, index) => {
                                const isMissing = MISSING_INDICES.includes(index);
                                const filledWord = filledSlots[index];

                                if (isMissing) {
                                    return (
                                        <div
                                            key={index}
                                            onDrop={(e) => handleDrop(e, index)}
                                            onDragOver={handleDragOver}
                                            onClick={() => filledWord && handleRemoveFromSlot(index, filledWord)}
                                            draggable={!!filledWord}
                                            onDragStart={(e) => filledWord && handleDragStart(e, filledWord, index)}
                                            className={`rounded-lg px-2 py-2.5 text-[13px] font-medium flex items-center transition-colors
                                                ${filledWord
                                                    ? "bg-[#18181A] border border-[#8B5CF6] text-white cursor-grab active:cursor-grabbing"
                                                    : "bg-transparent border border-dashed border-[#52525B] text-white"
                                                }`}
                                        >
                                            <span className="w-4 mr-1 text-white/50">{index + 1}.</span>
                                            {filledWord || ""}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={index} className="bg-black border border-[#262626] rounded-lg px-2 py-2.5 text-[13px] font-medium flex items-center text-white/50">
                                        <span className="w-4 mr-1">{index + 1}.</span> ********
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* STEP 2: Word Bank */}
                {step === 2 && (
                    <div className="grid grid-cols-3 gap-2 mt-8 min-h-12.5">
                        {bankWords.map((word, index) => (
                            <div
                                key={`bank-${index}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, word)}
                                onClick={() => handleSelectWord(word)}
                                className="bg-[#18181A] cursor-pointer active:scale-95 hover:bg-[#262626] border border-[#262626] rounded-lg px-3 py-2.5 text-[13px] font-medium flex justify-center items-center transition-all shadow-sm"
                            >
                                {word}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pb-6 w-full max-w-md mx-auto flex flex-col gap-4">
                {step === 2 && phraseConfirmError ? (
                    <p
                        className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm leading-relaxed text-red-300"
                        role="alert"
                    >
                        {phraseConfirmError}
                    </p>
                ) : null}
                <Button
                    onClick={handleContinue}
                    disabled={(step === 1 && !isRevealed) || (step === 2 && !isStep2Complete)}
                    className={`w-full h-14 rounded-xl font-semibold text-base transition-colors shadow-none
                        ${(step === 1 && !isRevealed) || (step === 2 && !isStep2Complete)
                            ? "bg-[#C4B5FD] text-black hover:bg-[#C4B5FD] opacity-70"
                            : "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                        }`}
                >
                    Continue
                </Button>

                <button className="text-[#6366F1] font-medium text-sm hover:text-[#4F46E5] transition-colors">
                    Remind me later
                </button>
            </div>
        </div>
    );
}