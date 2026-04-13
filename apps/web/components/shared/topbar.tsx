"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
    title: string;
    subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
    const { theme, setTheme } = useTheme();

    return (
        <div className="h-14 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-10">
            <div>
                <h1 className="text-sm font-semibold">{title}</h1>
                {subtitle && (
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setTheme("light")}
                >
                    <Sun className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setTheme("dark")}
                >
                    <Moon className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setTheme("system")}
                >
                    <Monitor className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}