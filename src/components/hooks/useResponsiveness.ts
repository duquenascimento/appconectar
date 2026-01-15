import { useWindowDimensions } from "react-native";

export const useResponsiveness = () => {
    const { width:screenWidth } = useWindowDimensions();
    return {
        screenWidth,
        isLargeScreen: screenWidth >= 1024,
    };
};