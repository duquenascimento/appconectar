import { View, Text } from "tamagui";
import Icons from "@expo/vector-icons/Ionicons";

type LabelAndBoxContentProps = {
  title: string;
  subtitle: string;
  iconName: "download";
  icon: boolean;
  iconAction?: () => void;
};

export default function LabelAndBoxContent({
  title,
  subtitle,
  iconName,
  icon = false,
  iconAction,
}: LabelAndBoxContentProps) {
  return (
    <View
      borderColor="lightgray"
      borderWidth={1}
      minHeight={56}
      borderRadius={6}
      alignItems="center"
      px={6}
      flexDirection="row"
      gap={12}
      pointerEvents="box-none"
    >
      <View
        backgroundColor="lightgray"
        width={36}
        height={36}
        borderRadius={90}
        justifyContent="center"
        alignItems="center"
      >
        <Icons size={20} name="reader" />
      </View>
      <View>
        <Text>{title}</Text>
        <Text fontSize={10} color="gray">
          {subtitle}
        </Text>
      </View>
      {icon && (
        <View flex={1} alignItems="flex-end">
          <Icons
            size={24}
            name={iconName}
            onPress={() => {
              if (typeof iconAction !== "undefined") iconAction();
            }}
          />
        </View>
      )}
    </View>
  );
}
