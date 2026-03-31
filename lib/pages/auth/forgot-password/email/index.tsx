"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from 'next/navigation';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- ZOD SCHEMA ---
const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
});

export default function ForgotPasswordEmailForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
        },
    });

    const isEmailValid = form.formState.isValid;

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setLoading(true);
        
        // Dummy API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Submitted Email:", data.email);
        
        setLoading(false);
        // Navigate to verification screen with email as query param
        router.push(`/forgot-password/verification?email=${encodeURIComponent(data.email)}`);
    }

    return (
        <div className="fixed inset-0 w-full h-dvh bg-black text-white flex flex-col px-6 py-12">
            
            {/* --- HEADER --- */}
            <div className="mt-8 mb-10 text-left">
                <h1 className="text-3xl font-bold mb-2 tracking-tight">Forgot passcode.</h1>
                <p className="text-[#A1A1AA] text-[15px]">Enter your email address.</p>
            </div>

            {/* --- FORM --- */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1">
                    
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <label className="text-xs text-[#A1A1AA] mb-2 block">
                                    Email address
                                </label>
                                <FormControl>
                                    <Input
                                        placeholder="Enter email address"
                                        className="h-14 bg-transparent border-[#333333] rounded-xl focus-visible:ring-1 focus-visible:ring-[#8B5CF6] focus-visible:border-[#8B5CF6] text-white placeholder:text-[#52525B]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-red-500 text-xs" />
                            </FormItem>
                        )}
                    />

                    {/* --- BOTTOM BUTTON --- */}
                    {/* mt-auto pushes the button to the bottom of the screen */}
                    <div className="mt-auto pb-6 w-full max-w-md mx-auto">
                        <Button
                            type="submit"
                            disabled={!isEmailValid || loading}
                            className={`w-full h-14 rounded-xl text-white font-semibold text-base transition-colors ${
                                isEmailValid 
                                    ? "bg-[#8B5CF6] hover:bg-[#7C3AED]" // Solid purple 
                                    : "bg-[#A78BFA]/60 cursor-not-allowed" // Faded purple
                            }`}
                        >
                            {loading ? "Please wait..." : "Continue"}
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    );
}