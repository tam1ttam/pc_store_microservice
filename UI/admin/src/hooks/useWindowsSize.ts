import { useState, useEffect } from 'react';

// Định nghĩa interface cho window size state
interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
}

// Hook useWindowSize với khả năng phân biệt màn hình di động, iPad và PC
const useWindowSize = (): WindowSize => {
  // Khởi tạo state để lưu kích thước cửa sổ và loại thiết bị
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth <= 1024 : false // Định nghĩa màn hình di động và iPad khi chiều rộng <= 1024px
  });

  useEffect(() => {
    // Kiểm tra xem window có tồn tại không (để tránh lỗi khi chạy trên server)
    if (typeof window === 'undefined') {
      return;
    }

    // Hàm xử lý khi cửa sổ thay đổi kích thước
    const handleResize = (): void => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth <= 1024 // Kiểm tra lại nếu màn hình đang là di động hoặc iPad
      });
    };

    // Gắn sự kiện thay đổi kích thước vào window
    window.addEventListener('resize', handleResize);

    // Dọn dẹp sự kiện khi component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export default useWindowSize;