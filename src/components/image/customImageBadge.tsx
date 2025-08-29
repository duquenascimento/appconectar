import React from "react";
import { Text, View } from "react-native";
import { Image } from "tamagui";

type ImageWithBadgeProps = {
  uri: string;
  badgeText?: string;
  badgeTextSize?: number;
  badgeColor?: string;
  badgeTextColor?: string;
};

export const CustomImageBadge: React.FC<ImageWithBadgeProps> = ({
  uri,
  badgeText = "--",
  badgeTextSize = 12,
  badgeColor = "red",
  badgeTextColor = "white",
}) => {
  const badgeLabel = badgeText.slice(0, 2).toUpperCase();

  return (
    <View
      style={{
        position: "relative",
        width: 60,
        height: 60,
      }}
    >
      <Image source={{ uri }} width={60} height={60} borderRadius={6} />
      <View
        style={{
          position: "absolute",
          top: 35,
          right: 5,
          width: 20,
          height: 20,
          borderRadius: 25,
          backgroundColor: badgeColor,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: badgeTextColor,
            fontSize: badgeTextSize,
            fontWeight: "bold",
          }}
        >
          {badgeLabel}
        </Text>
      </View>
    </View>
  );
};
