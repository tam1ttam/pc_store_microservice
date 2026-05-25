import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Monitor, Keyboard, Mouse, Headphones, MemoryStick, HardDrive, Cpu, CircuitBoard, Layers, Laptop } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProductSlider from "@/components/ProductSlider";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    PC: Cpu,
    Laptop: Laptop,
    Monitor: Monitor,
    Keyboard: Keyboard,
    Mouse: Mouse,
    Headphone: Headphones,
    RAM: MemoryStick,
    SSD: HardDrive,
    VGA: Layers,
    Mainboard: CircuitBoard,
};

const CATEGORIES_HOME = ["PC", "Laptop", "Monitor", "Keyboard", "Mouse", "Headphone", "RAM", "SSD", "VGA", "Mainboard"];

const Home = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleCategoryClick = (category: string) => {
        navigate(`/products?category=${encodeURIComponent(category)}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
            <section className="container py-12">
                <div className="rounded-lg px-6 py-10 md:px-12 md:py-16 text-center">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                        {t('product.heroTitle')}
                    </h1>
                    <p className="text-gray-300 max-w-[700px] mx-auto mb-8">
                        {t('product.heroDesc')}
                    </p>
                    <Button size="lg" onClick={() => navigate("/products")}>
                        {t('product.shopNow')}
                    </Button>
                </div>
            </section>

            {/* Slider 1: Best Selling */}
            <ProductSlider title={t('product.bestSelling')} type="best-selling" />

            {/* Slider 2: New Arrivals */}
            <ProductSlider title={t('product.newArrivals')} type="newest" />

            {/* Categories */}
            <section className="container py-14 w-full">
                <h2 className="text-2xl font-bold tracking-tight mb-8 text-center">{t('product.productCategories')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 px-2">
                    {CATEGORIES_HOME.map((cat) => {
                        const Icon = CATEGORY_ICONS[cat];
                        return (
                            <button
                                key={cat}
                                onClick={() => handleCategoryClick(cat)}
                                className="flex flex-col items-center justify-center p-5 rounded-xl border border-white/10 bg-white/5 hover:border-orange-500 hover:bg-orange-500/10 hover:text-orange-400 transition-all duration-200 group"
                            >
                                <Icon className="h-9 w-9 mb-3 text-white/70 group-hover:text-orange-400 transition-colors" />
                                <span className="font-semibold text-sm text-white/80 group-hover:text-orange-400 transition-colors">
                                    {cat}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Home;
