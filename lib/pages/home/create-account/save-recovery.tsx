"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { generatePhrase } from "@/lib/api";
import { useNavigate, useLocation } from "@/lib/pages-adapter";

// Indices of the words to hide in the confirmation step (0-based)
const MISSING_INDICES = [2, 5, 9];

export default function SaveRecoveryPhrase() {
    const navigate = useNavigate();
    const location = useLocation();
    const action = location.state?.action ?? "create";
    const isImport = action === "import";


    const [step, setStep] = useState<1 | 2>(1);
    const [isRevealed, setIsRevealed] = useState(false);

    // Create flow state
    const [phraseWords, setPhraseWords] = useState<string[]>([]);
    const [loadingPhrase, setLoadingPhrase] = useState(!isImport);
    const [phraseError, setPhraseError] = useState<string | null>(null);

    // Import flow state
    const [importInput, setImportInput] = useState("");
    const [importError, setImportError] = useState<string | null>(null);

    // Drag and drop state
    const [bankWords, setBankWords] = useState<string[]>([]);
    const [filledSlots, setFilledSlots] = useState<Record<number, string | null>>({});

    // Determine if Step 2 is fully filled out
    const isStep2Complete = MISSING_INDICES.every((index) => filledSlots[index] !== null);

    // --- Fetch phrase on mount ---
    useEffect(() => {
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
    }, []);

    const handleContinue = () => {
        if (step === 1 && isRevealed) {
            setStep(2);
        } else if (step === 2 && isStep2Complete) {
            const allCorrect = MISSING_INDICES.every(
                (index) => filledSlots[index] === phraseWords[index]
            );

            if (!allCorrect) {
                console.warn("[SaveRecovery] Phrase confirmation failed — wrong words placed.");
                alert("Some words are incorrect. Please check and try again.");
                return;
            }

            const phrase = phraseWords.join(" ");
            navigate("/create-account", { state: { phrase, action: "create" } });
        }
    };

    const handleBack = () => {
        if (step === 2) {
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
        setFilledSlots((prev) => ({ ...prev, [index]: null }));
        setBankWords((prev) => [...prev, word]);
    };

    const handleSelectWord = (word: string) => {
        // Find the first empty slot among missing indices
        const firstEmptyIndex = MISSING_INDICES.find((idx) => filledSlots[idx] === null);
        if (firstEmptyIndex === undefined) return;

        setFilledSlots((prev) => ({ ...prev, [firstEmptyIndex]: word }));
        setBankWords((prev) => prev.filter((w) => w !== word));
    };

    // --- Import mode: validate and navigate with the user's phrase ---
    const handleImportSubmit = () => {
        const words = importInput.trim().split(/\s+/);

        if (words.length !== 12) {
            setImportError(`Expected 12 words, got ${words.length}`);
            return;
        }

        const phrase = words.join(" ");
        navigate("/create-account", { state: { phrase, action: "import" } });
    };

    // --- Import mode render ---
    if (isImport) {
        return (
            <div className="fixed inset-0 w-full h-dvh bg-[#050505] text-white flex flex-col px-6 py-12">
                <div className="flex-1 flex flex-col mt-2 w-full max-w-md mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-[#18181A] flex items-center justify-center mb-6 hover:bg-[#262626] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/70" />
                    </button>

                    <h1 className="text-3xl font-bold tracking-tight mb-4 leading-snug">
                        Import your wallet
                    </h1>
                    <p className="text-[#A1A1AA] text-[15px] leading-relaxed mb-8">
                        Enter your 12-word Secret Recovery Phrase separated by spaces.
                    </p>

                    <textarea
                        value={importInput}
                        onChange={(e) => {
                            setImportInput(e.target.value);
                            setImportError(null);
                        }}
                        placeholder="word1 word2 word3 ... word12"
                        rows={4}
                        className="w-full bg-[#141414] border border-[#262626] focus:border-[#8B5CF6] outline-none rounded-xl p-4 text-white text-sm placeholder:text-[#52525B] resize-none leading-relaxed transition-colors"
                    />

                    {importError && (
                        <p className="text-red-400 text-xs mt-2">{importError}</p>
                    )}

                    <p className="text-[#52525B] text-xs mt-2">
                        {importInput.trim() ? `${importInput.trim().split(/\s+/).length} / 12 words` : ""}
                    </p>
                </div>

                <div className="mt-auto pb-6 w-full max-w-md mx-auto">
                    <Button
                        onClick={handleImportSubmit}
                        disabled={importInput.trim().split(/\s+/).length !== 12}
                        className="w-full h-14 rounded-xl font-semibold text-base transition-colors shadow-none bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-50"
                    >
                        Continue
                    </Button>
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