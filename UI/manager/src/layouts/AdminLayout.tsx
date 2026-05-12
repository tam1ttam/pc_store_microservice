import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 w-full mr-72">
                <div className="pt-20 md:pt-6 px-4 md:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
