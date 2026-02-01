"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type ActiveUIElement = "search" | "userDropdown" | "notifications" | null;

interface ActiveUIContextType {
    activeElement: ActiveUIElement;
    setActiveElement: (element: ActiveUIElement) => void;
    closeAll: () => void;
}

const ActiveUIContext = createContext<ActiveUIContextType | undefined>(undefined);

export function ActiveUIProvider({ children }: { children: React.ReactNode }) {
    const [activeElement, setActiveElementState] = useState<ActiveUIElement>(null);

    const setActiveElement = useCallback((element: ActiveUIElement) => {
        setActiveElementState(element);
    }, []);

    const closeAll = useCallback(() => {
        setActiveElementState(null);
    }, []);

    return (
        <ActiveUIContext.Provider value={{ activeElement, setActiveElement, closeAll }}>
            {children}
        </ActiveUIContext.Provider>
    );
}

export function useActiveUI() {
    const context = useContext(ActiveUIContext);
    if (context === undefined) {
        throw new Error("useActiveUI must be used within an ActiveUIProvider");
    }
    return context;
}
