"use client"

import Image from "next/image";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginDrawer from "../auth/login/login-drawer";
import CreateAccountDrawer from "../home/create-account/create-account-drawer";
import "../../layouts/HomeLayout.css";
import "./Onboarding.css";


// Assets
// /assets/images/illustrations/onboard-one.svg
const onboardOne = '/assets/images/illustrations/onboard-one.svg';
const nairaIcon = '/assets/images/illustrations/naira.svg';
const onboardTwo = '/assets/images/illustrations/onboard-two.svg';
const coinImg = '/assets/images/illustrations/IMG_5094 1.svg';
const dollarIcon = '/assets/images/illustrations/Dollar coin - Gold@4x 1.svg';
const chartRing = '/assets/images/illustrations/IMG_5091 1.svg';
const listCards = '/assets/images/illustrations/Group 120 (2).png';
const goldCoinSecondary = '/assets/images/illustrations/Dollar coin - Gold@4x 1 (1).svg';
const chartMockup = '/assets/images/illustrations/Chart Mockup III 1.svg';

const onboardingData = [
    {
        title: "Trade in chats.",
        description: "Jumpa lets you trade, send money, and move between stablecoins and local cash.",
    },
    {
        title: "Trade together.",
        description: "Pool funds. Assign a trader. Automatically split profits. Built for communities.",
    },
    {
        title: "Your Financial Agent.",
        description: "Set price alerts. Auto-execute trades. Split bills with voice. Save toward goals.",
    },
    {
        title: "Smart Saving Agent.",
        description: "A smart savings agent that invests your funds to help you reach your goals.",
    },
];

export default function Onboarding() {
    const [currentScreen, setCurrentScreen] = useState(0);
    const touchStartX = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartX.current === null) return;

        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;

        // Swipe threshold
        if (diff > 50 && currentScreen < onboardingData.length) {
            setCurrentScreen((prev) => prev + 1);
        } else if (diff < -50 && currentScreen > 0) {
            setCurrentScreen((prev) => prev - 1);
        }

        touchStartX.current = null;
    };

    const handleNext = () => {
        if (currentScreen < onboardingData.length) {
            setCurrentScreen((prev) => prev + 1);
        }
    };

    const handleSkip = () => {
        setCurrentScreen(onboardingData.length);
    };

    // --- FINAL SCREEN (WALLET CREATION) ---
    if (currentScreen === onboardingData.length) {
        return (
            <div className="flex h-full min-h-0 w-full flex-col justify-center items-center overflow-y-auto overflow-x-hidden bg-black bg-cover bg-center bg-no-repeat pb-6 sm:pb-10 px-4 sm:px-6">
                <div className="flex items-center justify-center mb-8 sm:mb-12 w-[80%] sm:w-full max-w-[250px]">
                    <Image
                        src="/large-logo.svg"
                        alt="Jumpa Logo"
                        width={1000}
                        height={500}
                        className="w-full h-full object-contain"
                        priority
                    />
                </div>

                <div className="w-full flex flex-col gap-3 max-w-md pb-4 sm:pb-6">
                    <CreateAccountDrawer />
                    <LoginDrawer />
                </div>
            </div>
        );
    }

    // --- ONBOARDING CAROUSEL SCREENS (1-4) ---
    const screenData = onboardingData[currentScreen];

    const renderIllustration = () => {
        switch (currentScreen) {
            case 0:
                return (
                    <div className="onboarding-illustration-container">
                        <Image src={onboardOne} width={600} height={600} className="onboarding-img-one" alt="" priority />
                        <Image src={nairaIcon} width={240} height={240} className="onboarding-naira-icon" alt="" priority />
                    </div>
                );
            case 1:
                return (
                    <div className="onboarding-illustration-container">
                        <Image src={onboardTwo} width={600} height={600} className="onboarding-img-two" alt="" />
                        <Image src={coinImg} width={280} height={280} className="onboarding-coin-left" alt="" />
                        <Image src={dollarIcon} width={400} height={400} className="onboarding-coin-right" alt="" />
                    </div>
                );
            case 2:
                return (
                    <div className="onboarding-illustration-container onboarding-illustration--screen3">
                        <Image src={chartRing} width={330} height={330} className="onboarding-chart-ring" alt="" />
                        <Image src={listCards} width={420} height={420} className="onboarding-list-cards" alt="" />
                        <Image src={goldCoinSecondary} width={496} height={496} className="onboarding-gold-coin-alt" alt="" />
                    </div>
                );
            case 3:
                return (
                    <div className="onboarding-illustration-container">
                        <Image src={chartMockup} fill className="" alt="" />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className="flex h-full min-h-0 w-full flex-col items-center overflow-hidden bg-black bg-cover bg-center bg-no-repeat pb-6 sm:pb-10"
            style={{ backgroundImage: "url('/gradient-bg.svg')" }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className="w-full flex justify-end max-w-md z-50 px-4 sm:px-6" style={{ marginTop: "107px" }}>
                <button
                    onClick={handleSkip}
                    className="onboarding-skip-button"
                >
                    <span className="onboarding-skip-text">Skip</span>
                </button>
            </div>

            {/* Foreground Image Area - Removed max-w-md to allow edge-to-edge */}
            <div className="flex-1 w-full flex flex-col items-center justify-center my-4 sm:my-6 z-10 min-h-0 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentScreen}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        {renderIllustration()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Content (Text & Buttons) - Added px-4 back here */}
            <div className="onboarding-carousel-footer w-full max-w-md flex flex-col items-center pb-2 sm:pb-6 z-10 shrink-0 px-4 sm:px-6">
                {/* Pagination Dots */}
                <div className="flex gap-2 justify-center mb-4 sm:mb-6">
                    {onboardingData.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${currentScreen === index ? "bg-white" : "bg-white/30"
                                }`}
                        />
                    ))}
                </div>

                {/* Inline Title & Description */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentScreen}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="onboarding-text-container"
                    >
                        <p className="inline-block px-4">
                            <span className="onboarding-title">{screenData.title} </span>
                            <span className="onboarding-description">{screenData.description}</span>
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Get Started Button */}
                <button
                    onClick={handleNext}
                    className="onboarding-get-started-button"
                >
                    <span className="onboarding-get-started-text">Get started</span>
                </button>
            </div>
        </div>
    );
}