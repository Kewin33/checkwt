"use client";

import Link from "next/link";
import ThemeSwitcher from "@/app/components/ThemeSwitcher.tsx";
import DecoderForm from "../components/DecoderForm";
import TabsBar from "../components/TabsBar";
import { TabsContent } from "@/components/ui/tabs";
import EncoderForm from "../components/EncoderForm";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import JwtTextarea from "../components/JWTTextarea";
import PrettyPrint from "../components/prettyJWT";

export default function Home() {
    const [token, setToken] = useState("");
    const [header, setHeader] = useState("");
    const [payload, setPayload] = useState("");
    const [usedKey, setUsedKey] = useState("");
    const [signatureValid, setSignatureValid] = useState(null);
    const [signatureInvalidReason, setSignatureInvalidReason] = useState(null);
    const [tokenType, setTokenType] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [value, setValue] = useState<string>("");

    const focusTokenInput = () => {
        const el = document.getElementById("jwt") as HTMLTextAreaElement | null;
        if (!el) {
            return;
        }

        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
        const end = el.value.length;
        el.setSelectionRange(end, end);
    };

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            const data = event.data as { type?: unknown; text?: unknown } | undefined;
            if (!data || typeof data.type !== "string") {
                return;
            }

            if (data.type === "copyToDecode" || data.type === "send" || data.type === "draft") {
                if (typeof data.text !== "string") {
                    return;
                }
                setValue(data.text);
                setToken(data.text);
                return;
            }

            if (data.type === "focusDecodeTokenInput") {
                focusTokenInput();
            }
        };

        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);


    async function copyTextToClipboard(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            console.log('Text copied to clipboard');
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const clearState = () => {
        setErrorMessage(null);
        setHeader("");
        setPayload("");
        setUsedKey("");
        setSignatureValid(null);
        setSignatureInvalidReason(null);
        setTokenType("");
    }

    const setError = (error: string) => {
        clearState();
        setErrorMessage(error);
    }

    const handleDecode = async () => {
        if (!token) {
            clearState();
            return;
        }

        try {
            const res = await fetch("/api/decode", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });
            if (!res.ok) {
                const { error } = await res.json();
                setError(error);
                return;
            }
            setErrorMessage(null);
            const { header, payload, signatureValid, usedKey, type } = await res.json();
            const { verified, reason } = await signatureValid;
            setHeader(header ?? "");
            setPayload(payload ?? "");
            setSignatureValid(verified);
            setSignatureInvalidReason(reason);
            setUsedKey(usedKey ?? "");
            setTokenType(type ?? "");
        } catch (err) {
            setError("Failed to parse token.");
        }
    };

    useEffect(() => {
        handleDecode();
    }, [token])

    return (
        <>
            <div className="w-full h-screen p-4 md:p-10 space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <ThemeSwitcher />
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link href="/">Zu Info</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/chat">Zum Chat</Link>
                        </Button>
                    </div>
                </div>
                <div className="flex items-center mx-auto w-fit gap-4">
                    <img src="/favicon.ico" alt="favicon.ico" className="w-10 rounded-xl" />
                    <h1 className="font-bold text-4xl text-center">CheckWTF - Finally understand JWT and JWE's</h1>
                </div>
                <div className="opacity-60 text-sm mx-auto w-fit max-w-200 text-center">
                    Decode, verify, and generate JSON Web Tokens, which are an open, industry standard <a href="https://datatracker.ietf.org/doc/html/rfc7519" target="_blank" className="underline">RFC-7519</a> method for representing claims securely between two parties.
                </div>
                <TabsBar
                    onTabSelected={(tab) => console.log("Selected tab:", tab)}
                    tabsContent={
                        <div className="w-full">
                            <TabsContent className="w-full" value="decode">
                                <DecoderForm />
                            </TabsContent>
                            <TabsContent className="w-full" value="encode">
                                <EncoderForm />
                            </TabsContent>
                        </div>
                    }
                />
                
            </div>
        </>
    );
}
