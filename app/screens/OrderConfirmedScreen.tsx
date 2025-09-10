import { type NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { YStack, XStack, Text, Separator, Image } from "tamagui";
import Icons from "@expo/vector-icons/Ionicons";
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import CustomButton from "@/src/components/button/customButton";
import { SupplierData } from "@/src/types/types";
import { getStorage } from "@/src/utils/utils";
import { formatCurrency } from "../../src/utils/formatCurrency";
import { getDeliveryWindow } from "../../src/utils/timeUtils";
import { getPaymentDate } from "../../src/utils/getPaymentDate";

interface RestaurantAddress {
  address: string;
  neighborhood: string;
  city: string;
  localNumber: string;
  zipCode: string;
  initialDeliveryTime: string;
  finalDeliveryTime: string;
}

interface RestaurantData {
  name: string;
  addressInfos: RestaurantAddress[];
  paymentWay: string;
}

type RootStackParamList = {
  QuotationDetails: undefined;
  OrderConfirmed: { suppliers: SupplierData[]; deliveryDate?: string };
  Orders: undefined;
};

type OrderConfirmedRouteProp = RouteProp<RootStackParamList, "OrderConfirmed">;
type OrderConfirmedNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "OrderConfirmed"
>;

export default function OrderConfirmedScreen() {
  const navigation = useNavigation<OrderConfirmedNavigationProp>();
  const route = useRoute<OrderConfirmedRouteProp>();

  const { suppliers, deliveryDate } = route.params;

  const [restaurantDetails, setRestaurantDetails] =
    useState<RestaurantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDateOrder, setPaymentDateOrder] = useState<string | null>(null);

  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        const storedData = await getStorage("selectedRestaurant");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setRestaurantDetails(parsedData.restaurant);
          setPaymentDateOrder(getPaymentDate(parsedData.restaurant.paymentWay));
        } else {
          Alert.alert(
            "Erro",
            "Não foi possível encontrar os dados do restaurante."
          );
        }
      } catch (error) {
        console.error("Erro ao carregar dados do restaurante:", error);
        Alert.alert(
          "Erro",
          "Ocorreu um problema ao carregar as informações do restaurante."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadRestaurantData();
  }, []);

  const getFormattedAddress = () => {
    if (!restaurantDetails || !restaurantDetails.addressInfos.length) return "";
    const addr = restaurantDetails.addressInfos[0];
    return `${addr.address}, ${addr.localNumber} - ${addr.neighborhood}, ${addr.city}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F0F4F8",
        }}
      >
        <ActivityIndicator size="large" color="#1DC588" />
        <Text mt="$4">Carregando confirmação...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F0F4F8" }}>
      <YStack
        flex={1}
        backgroundColor="#F0F4F8"
        alignSelf="center"
        width="100%"
        maxWidth={Platform.OS === "web" ? 768 : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            p="$4"
            gap="$4"
          >
            <YStack alignItems="center" gap="$3">
              <YStack
                width={80}
                height={80}
                borderRadius={40}
                backgroundColor="white"
                alignItems="center"
                justifyContent="center"
                elevation={5}
              >
                <Icons name="checkmark" size={48} color="#1DC588" />
              </YStack>
              <Text fontSize={24} fontWeight="bold" color="$gray12">
                Pedidos confirmados!
              </Text>
            </YStack>

            <YStack width="100%" bg="white" br={8} p="$4" gap="$3">
              {suppliers.map(({ supplier }, index) => (
                <React.Fragment key={supplier.externalId}>
                  <XStack ai="center" jc="space-between">
                    <XStack ai="center" gap="$3">
                      <Image
                        source={{ uri: supplier.image }}
                        width={40}
                        height={40}
                        borderRadius={20}
                      />
                      <YStack>
                        <Text fontSize={16} fontWeight="bold">
                          {supplier.name}
                        </Text>
                        <XStack ai="center" gap="$1.5">
                          <Icons name="star" color="#F59E0B" size={14} />
                          <Text fontSize={12} color="$gray10">
                            {supplier.star}
                          </Text>
                        </XStack>
                      </YStack>
                    </XStack>
                    <YStack ai="flex-end">
                      <Text fontSize={16} fontWeight="bold">
                        {formatCurrency(supplier.discount.orderValueFinish)}
                      </Text>
                      <Text fontSize={12} color="$gray10">
                        Pedido {supplier.orderId ?? ""}
                      </Text>
                    </YStack>
                  </XStack>
                  {index < suppliers.length - 1 && (
                    <Separator borderColor="$gray4" />
                  )}
                </React.Fragment>
              ))}
            </YStack>

            {restaurantDetails && (
              <YStack width="100%" bg="white" br={8} p="$4" gap="$4">
                <XStack ai="flex-start" gap="$3">
                  <Icons name="location-outline" size={24} color="$gray11" />
                  <YStack flex={1}>
                    <Text fontSize={16} fontWeight="bold">
                      {restaurantDetails.name}
                    </Text>
                    <Text fontSize={14} color="$gray10">
                      {getFormattedAddress()}
                    </Text>
                  </YStack>
                </XStack>

                <XStack ai="flex-start" gap="$3">
                  <Icons name="time-outline" size={24} color="$gray11" />
                  <YStack>
                    <Text fontSize={16} fontWeight="bold">
                      {getDeliveryWindow(restaurantDetails)}
                    </Text>
                    <Text fontSize={14} color="$gray10">
                      {deliveryDate}
                    </Text>
                  </YStack>
                </XStack>

                <XStack ai="flex-start" gap="$3">
                  <Icons name="cash-outline" size={24} color="$gray11" />
                  <YStack>
                    <Text fontSize={16} fontWeight="bold">
                      {!paymentDateOrder ? "" : `Venc. ${paymentDateOrder}`}
                    </Text>
                    <Text fontSize={14} color="$gray10">
                      Pagamento via Boleto
                    </Text>
                  </YStack>
                </XStack>
              </YStack>
            )}
          </YStack>
        </ScrollView>

        <YStack py="$4" px="$4" bg="#F0F4F8">
          <CustomButton
            title="Ir para Meus pedidos"
            onPress={() => navigation.navigate("Orders")}
            backgroundColor="white"
            textColor="black"
          />
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
