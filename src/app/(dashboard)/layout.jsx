

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Footer from '../../components/layout/footer';
import Header from '../../components/layout/header';
import Sidebar from '../../components/layout/sidebar';
// import AiCopilot from '../../components/layout/AiCopilot';
import { Toaster } from "sonner";
export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    // useEffect(() => {
    //     const isLoggedIn = sessionStorage.getItem("isLoggedIn");

    //     if (isLoggedIn !== "true") {
    //         router.replace("/login");
    //         return;
    //     }

    //     setLoading(false);
    // }, [router]);

    useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {
        router.replace("/login");
        return;
    }

    setLoading(false);
    }, [router]);

    if (loading) {
        return null;
    }

    return (
        <>
        <Toaster position="top-center" richColors />
        
        <div className="flex h-screen w-screen overflow-hidden font-sans antialiased text-slate-900">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div
                className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${
                    isSidebarOpen ? 'lg:pl-64' : 'lg:pl-16'
                }`}
            >
                <Header setIsOpen={setIsSidebarOpen} isOpen={isSidebarOpen} />

                <div className="flex min-h-0 flex-1 overflow-hidden">
                    <main className="relative m-4 mr-0 flex-1 overflow-y-auto rounded-l-xl border border-white/10">
                        <div className="relative z-10">
                            {children}
                        </div>
                    </main>

                    {/* <div className="fixed inset-y-0 right-0 flex min-h-0 w-[min(320px,85vw)] lg:static lg:my-4 lg:mr-4 lg:w-auto">
                        <AiCopilot />
                    </div> */}
                </div>

                <Footer />
            </div>
        </div>
        </>
    );
}