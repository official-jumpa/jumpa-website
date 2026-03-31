"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, UserPlus, Mic, Send, Check, RotateCcw, Copy } from "lucide-react"
import Link from "next/link";

// Mock Chat Data
const MOCK_MESSAGES = [
    { type: 'system', text: 'Alice joined' },
    { type: 'system', text: 'Bob joined' },
    {
        type: 'user',
        text: 'Dinner last night was 120 dollars, split between Alice, Bob, and me. Bob had extra drinks so add 20 to his share',
        time: '2m ago',
        read: true,
        avatar: 'bg-[#FCA5A5]' // Peach
    },
    {
        type: 'bot',
        text: 'Processing...\nBot its to pay $80 including extra drink, Alice to pay $60',
        time: '2m ago',
        read: true,
        avatar: 'bg-[#2DD4BF]' // Cyan
    },
    {
        type: 'user',
        text: 'Provide wallet address it will be sent to',
        time: '1m ago',
        read: true,
        avatar: 'bg-[#FCA5A5]'
    },
    {
        type: 'user',
        text: '0x295cCa3BD7C8C854b7c528d7b0dC810CFFfc44e',
        time: '1m ago',
        read: true,
        avatar: 'bg-[#FCA5A5]'
    },
    {
        type: 'other',
        text: 'Okay Aaron I will be sending mine soon!',
        time: '1m ago',
        read: true,
        avatar: 'bg-[#B45309]' // Brown
    },
]

export default function GroupFlow() {
    // App States
    const [view, setView] = useState<"intro" | "chat">("intro");
    const [chatState, setChatState] = useState<"empty" | "active">("empty");
    const [inputMode, setInputMode] = useState<"text" | "recording" | "transcribed">("text");
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    // Form States
    const [inputText, setInputText] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (view === "chat" && chatState === "active") {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [view, chatState]);

    // Handlers
    const handleSend = () => {
        if (!inputText.trim() && inputMode !== 'transcribed') return;
        setChatState("active");
        setInputMode("text");
        setInputText("");
    };

    const handleCopyLink = () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // --- RENDER: INTRO SCREEN ---
    if (view === "intro") {
        return (
            <div className="fixed inset-0 w-full h-dvh bg-black text-white flex justify-center font-poppins">
                <div className="w-full max-w-md flex flex-col h-full relative overflow-y-auto">
                    {/* Header */}
                    <div className="px-5 pt-6 pb-4 shrink-0">
                        <Link href="/home">
                            <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <ArrowLeft className="w-4 h-4 text-white" />
                            </button>
                        </Link>
                    </div>

                    <div className="px-6 flex-1 flex flex-col pb-10">

                        <img src="/group_home.svg" alt="" className="w-full h-full" />
                        <div className="space-y-6">
                            <img src="/cards.svg" alt="" />
                        </div>

                        {/* Bottom Graphic Mockup (Clickable to proceed) */}
                        <div
                            onClick={() => setView("chat")}
                            className="mt-auto pt-8 flex justify-center relative cursor-pointer group hover:opacity-90 transition-opacity"
                        >
                            <img src="/card3.png" alt="" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: CHAT SCREEN ---
    return (
        <div className="fixed inset-0 w-full h-dvh bg-[#050505] text-white flex justify-center">
            <div className="w-full max-w-md flex flex-col h-full relative">

                {/* Header */}
                <div className="px-5 pt-8 pb-4 flex justify-between items-start shrink-0 z-10">
                    {chatState === "empty" ? (
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold mb-1">Hi Anita</h2>
                            <h1 className="text-2xl font-bold mb-2">Add friends to join</h1>
                            <p className="text-sm text-gray-400">Click on the icon above to add friends.</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button onClick={() => { setChatState("empty"); setView("intro") }} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <ArrowLeft className="w-4 h-4 text-white" />
                            </button>
                            <span className="font-semibold text-lg">Group Split</span>
                        </div>
                    )}

                    <button
                        onClick={() => setIsInviteOpen(true)}
                        className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center hover:bg-[#2C2C2E] transition-colors"
                    >
                        <UserPlus className="w-5 h-5 text-gray-300" />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4 custom-scrollbar flex flex-col">
                    {chatState === "active" && (
                        <div className="flex flex-col gap-6 mt-auto">
                            {MOCK_MESSAGES.map((msg, idx) => (
                                <div key={idx} className="flex flex-col w-full">
                                    {/* System Message */}
                                    {msg.type === 'system' && (
                                        <div className="flex justify-center mb-1">
                                            <span className="bg-white text-black text-[11px] font-bold px-4 py-1 rounded-full">{msg.text}</span>
                                        </div>
                                    )}

                                    {/* User (Right Side) */}
                                    {msg.type === 'user' && (
                                        <div className="flex items-end justify-end gap-2 mb-1 w-full pl-12">
                                            <div className="flex flex-col items-end">
                                                <div className="bg-white text-[#5B3EE4] p-4 rounded-2xl rounded-tr-sm text-[13px] font-medium leading-relaxed shadow-sm">
                                                    {msg.text}
                                                </div>
                                                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                                                    <span className="text-[#00C259] font-semibold">Read</span>
                                                    <span>•</span>
                                                    <span>{msg.time}</span>
                                                </div>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full ${msg.avatar} shrink-0 border-2 border-black flex items-center justify-center overflow-hidden`}>
                                                <img src="/api/placeholder/32/32" alt="avatar" className="opacity-50 mix-blend-multiply" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Bot (Left Side) */}
                                    {msg.type === 'bot' && (
                                        <div className="flex items-end justify-start gap-2 mb-1 w-full pr-12">
                                            <div className={`w-8 h-8 rounded-full ${msg.avatar} shrink-0 border-2 border-black flex items-center justify-center overflow-hidden`}>
                                                <img src="/api/placeholder/32/32" alt="bot" className="opacity-50 mix-blend-multiply" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <div className="bg-[#FF3366] text-white p-4 rounded-2xl rounded-tl-sm text-[13px] font-medium leading-relaxed shadow-sm whitespace-pre-wrap">
                                                    {msg.text}
                                                </div>
                                                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                                                    <span className="text-[#00C259] font-semibold">Read</span>
                                                    <span>•</span>
                                                    <span>{msg.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Other User (Left Side) */}
                                    {msg.type === 'other' && (
                                        <div className="flex items-end justify-start gap-2 mb-1 w-full pr-12">
                                            <div className={`w-8 h-8 rounded-full ${msg.avatar} shrink-0 border-2 border-black flex items-center justify-center overflow-hidden`}>
                                                <img src="/api/placeholder/32/32" alt="user" className="opacity-50 mix-blend-multiply" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <div className="bg-[#D1FAE5] text-black p-4 rounded-2xl rounded-tl-sm text-[13px] font-medium leading-relaxed shadow-sm">
                                                    {msg.text}
                                                </div>
                                                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                                                    <span className="text-[#00C259] font-semibold">Read</span>
                                                    <span>•</span>
                                                    <span>{msg.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Typing indicator (Bot) */}
                            <div className="flex items-end justify-start gap-2 w-full animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-[#2DD4BF] shrink-0 border-2 border-black"></div>
                                <div className="bg-[#FF3366] text-white px-4 py-3 rounded-2xl rounded-tl-sm flex items-center justify-center gap-1.5 h-10">
                                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                                </div>
                            </div>

                            <div ref={chatEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black via-black to-transparent pt-10">

                    {/* Mode 1: Text Input */}
                    {inputMode === "text" && (
                        <div className="bg-[#1C1132] border border-[#3A2252] rounded-full flex items-center p-1.5 pl-3 h-14 transition-all">
                            <button
                                onClick={() => setInputMode("recording")}
                                className="w-9 h-9 rounded-full bg-[#3A2252] flex items-center justify-center shrink-0 hover:bg-[#4d2d6e] transition-colors"
                            >
                                <Mic className="w-4 h-4 text-[#C4B5FD]" />
                            </button>
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask anything"
                                className="flex-1 bg-transparent border-none text-sm text-white px-3 focus:outline-none placeholder-gray-400"
                            />
                            <button
                                onClick={handleSend}
                                className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center shrink-0 hover:bg-[#7C3AED] transition-colors"
                            >
                                <Send className="w-4 h-4 text-white -ml-0.5" />
                            </button>
                        </div>
                    )}

                    {/* Mode 2: Recording Audio */}
                    {inputMode === "recording" && (
                        <div className="bg-[#1C1132] border border-[#3A2252] rounded-full flex items-center justify-between p-1.5 px-4 h-14 transition-all animate-in slide-in-from-bottom-2">
                            {/* Animated Audio Waveform */}
                            <div className="flex items-center gap-[3px] h-6 flex-1 px-2">
                                {[...Array(25)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-[3px] bg-white rounded-full animate-pulse"
                                        style={{
                                            height: `${Math.max(20, Math.random() * 100)}%`,
                                            animationDelay: `${Math.random() * 0.5}s`,
                                            animationDuration: '0.8s'
                                        }}
                                    ></div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => setInputMode("text")}
                                    className="w-10 h-10 rounded-full bg-[#3A2252] flex items-center justify-center hover:bg-[#4d2d6e] transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4 text-[#C4B5FD]" />
                                </button>
                                <button
                                    onClick={() => setInputMode("transcribed")}
                                    className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center hover:bg-[#7C3AED] transition-colors"
                                >
                                    <Check className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mode 3: Transcribed Audio Ready to Send */}
                    {inputMode === "transcribed" && (
                        <div className="bg-[#1C1132] border border-[#3A2252] rounded-3xl flex items-end p-2 px-3 min-h-14 transition-all animate-in slide-in-from-bottom-2 relative">
                            <button
                                onClick={() => setInputMode("text")}
                                className="w-9 h-9 rounded-full bg-[#3A2252] flex items-center justify-center shrink-0 mb-1 hover:bg-[#4d2d6e] transition-colors"
                            >
                                <Mic className="w-4 h-4 text-[#C4B5FD]" />
                            </button>
                            <div className="flex-1 px-3 py-2.5 text-[13px] text-white max-h-[100px] overflow-y-auto leading-relaxed">
                                "Dinner last night was 120 dollars, split between Alice, Bob, and me. Bob had extra drinks so add 20 to his share."
                            </div>
                            <button
                                onClick={handleSend}
                                className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center shrink-0 mb-0.5 hover:bg-[#7C3AED] transition-colors"
                            >
                                <Send className="w-4 h-4 text-white -ml-0.5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* --- INVITE MODAL OVERLAY --- */}
                {isInviteOpen && (
                    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 px-4 pb-10">
                        {/* Invisible clickable backdrop to close */}
                        <div className="absolute inset-0" onClick={() => setIsInviteOpen(false)}></div>

                        <div className="bg-[#F3E8FF] w-full max-w-[340px] rounded-4xl p-6 relative shadow-2xl animate-in slide-in-from-bottom-8 duration-300 flex flex-col items-center text-center">

                            {/* Goggles Icon SVG */}
                            <div className="mb-4">
                               <img src="/spiral.svg" alt="" />
                            </div>

                            <h2 className="text-[22px] font-bold text-black tracking-tight mb-2">Invite friends</h2>
                            <p className="text-[13px] text-gray-600 leading-relaxed mb-6 px-4">
                                Bring your friends along, splitting bills has never been easier
                            </p>

                            <div className="w-full bg-white rounded-2xl p-1.5 flex items-center justify-between border border-purple-100 shadow-sm">
                                <span className="text-[13px] text-[#5B3EE4] font-medium pl-3 truncate">
                                    https://menee.34
                                </span>
                                <button
                                    onClick={handleCopyLink}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isCopied ? "bg-green-100 text-green-600" : "hover:bg-purple-50 text-[#8B5CF6]"
                                        }`}
                                >
                                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}