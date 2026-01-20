import { useWindowDimensions } from "react-native";

enum ScreenSizeBreakpoints {
    SMALL = 0,
    MEDIUM = 768,
    LARGE = 1024,
}

export const useResponsiveness = () => {
    const { width: screenWidth } = useWindowDimensions();
    return {
        screenWidth,
        isLargeScreen: screenWidth >= ScreenSizeBreakpoints.LARGE,
    };
};
