import React from "react";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { ActiveUIProvider } from "../contexts/ActiveUIContext";
import { GlobalTransitionProvider } from "./contexts/GlobalTransitionContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ActiveUIProvider>
            <GlobalTransitionProvider className="min-h-screen bg-gray-50 font-sans">
                <Sidebar />
                <DashboardHeader />
                <main className="ml-60 pt-16 min-h-screen">
                    {children}
                </main>
            </GlobalTransitionProvider>
        </ActiveUIProvider>
    );
}
