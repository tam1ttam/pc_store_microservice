export default function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 animate-pulse">
                    <div className="flex gap-8">
                        {/* Ảnh sản phẩm skeleton */}
                        <div className="w-[35%]">
                            <div className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700" />
                        </div>

                        {/* Thông tin sản phẩm skeleton */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 mb-2" />
                                <div className="flex items-center gap-4">
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                                </div>
                            </div>

                            <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6">
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 mb-2" />
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-24" />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                                </div>
                            </div>

                            <div className="space-y-4 pt-6">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64" />
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-72" />
                            </div>
                        </div>
                    </div>

                    {/* Mô tả sản phẩm skeleton */}
                    <div className="mt-12">
                        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
