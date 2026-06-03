
const ProductSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
            <div className="p-4 space-y-3">
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex gap-2">
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </div>
    );
}

export default ProductSkeleton;