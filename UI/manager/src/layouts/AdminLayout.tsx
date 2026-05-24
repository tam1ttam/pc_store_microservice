import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            <Sidebar />
            {/* ml-64 = 16rem, offset cho fixed left sidebar; mr-72 = 18rem, offset cho fixed right chat sidebar */}
            <main className="ml-64 mr-72">
                <div className="pt-20 md:pt-6 px-4 md:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
