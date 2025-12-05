import { useEffect, useState } from 'react';

enum Breakpoints {
    Mobile = 480,
    Tablet = 768,
    Desktop = 1024,
    LargeDesktop = 1200,
}

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return { width, height };
}

interface UseWindowDimensionsReturn {
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isLargeDesktop: boolean;
}

export default function useWindowDimensions(): UseWindowDimensionsReturn {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const width = windowDimensions.width;
    const height = windowDimensions.height;

    const isMobile = width <= Breakpoints.Mobile;
    const isTablet = width > Breakpoints.Mobile && width <= Breakpoints.Tablet;
    const isDesktop = width > Breakpoints.Tablet && width <= Breakpoints.Desktop;
    const isLargeDesktop = width > Breakpoints.Desktop;

    return { width, height, isMobile, isTablet, isDesktop, isLargeDesktop };
}

