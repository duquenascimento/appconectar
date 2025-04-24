import { type NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Stack, Text, View, Image, Button, Input } from "tamagui";
import Icons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  VirtualizedList,
  Dimensions,
} from "react-native";
import React from "react";
import { DateTime } from "luxon";
import DropDownPicker from "react-native-dropdown-picker";
import { clearStorage, getToken, setStorage } from "../utils/utils";
import DialogInstanceNotification from "../../src/components/modais/DialogInstanceNotification";
import CustomAlert from "../../src/components/modais/CustomAlert"; // Importe o CustomAlert
import { loadRestaurants } from "../../src/services/restaurantService";

type RootStackParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Confirm: undefined;
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

export interface Product {
  price: number;
  priceWithoutTax: number;
  name: string;
  sku: string;
  quant: number;
  orderQuant: number;
  obs: string;
  priceUnique: number;
  priceUniqueWithTaxAndDiscount: number;
  image: string[];
  orderUnit: string;
}

export interface Discount {
  orderValue: number;
  discount: number;
  orderWithoutTax: number;
  orderWithTax: number;
  tax: number;
  missingItens: number;
  orderValueFinish: number;
  product: Product[];
  sku: string;
}

export interface Supplier {
  name: string;
  externalId: string;
  missingItens: number;
  minimumOrder: number;
  hour: string;
  discount: Discount;
  star: string;
}

export interface SupplierData {
  supplier: Supplier;
}

type SelectItem = {
  name: string;
  addressInfos: any[];
  premium: boolean;
};

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState(getScreenSize());

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize(getScreenSize());
    };

    const subscription = Dimensions.addEventListener(
      "change",
      updateScreenSize
    );

    return () => subscription.remove();
  }, []);

  return screenSize;
};

const getScreenSize = () => {
  const width = Dimensions.get("window").width;
  return width >= 1280 ? "xl" : "sm";
};

const SupplierBox = ({
  supplier,
  available,
  goToConfirm,
  selectedRestaurant,
}: {
  supplier: SupplierData;
  star: string;
  available: boolean;
  selectedRestaurant: any;
  goToConfirm: (supplier: SupplierData, selectedRestaurant: any) => void;
}) => {
  const isOpen = () => {
    const currentDate = DateTime.now().setZone("America/Sao_Paulo");
    const currentHour = Number(
      `${
        currentDate.hour.toString().length < 2
          ? `0${currentDate.hour}`
          : currentDate.hour
      }${
        currentDate.minute.toString().length < 2
          ? `0${currentDate.minute}`
          : currentDate.minute
      }${
        currentDate.second.toString().length < 2
          ? `0${currentDate.second}`
          : currentDate.second
      }`
    );
    return (
      Number(supplier.supplier.hour.replaceAll(":", "")) < currentHour &&
      supplier.supplier.missingItens > 0
    );
  };

  return (
    <View
      opacity={!isOpen() ? 1 : 0.4}
      onPress={() => {
        if (supplier.supplier.missingItens > 0) {
          goToConfirm(supplier, selectedRestaurant);
        }
      }}
      flexDirection="row"
      borderBottomWidth={0.1}
      borderBottomColor="lightgray"
    >
      <View flexDirection="row" f={1}>
        <View p={5}>
          <Image
            source={{
              uri: `https://cdn.conectarhortifruti.com.br/files/images/supplier/${supplier.supplier.externalId}.jpg`,
            }}
            width={50}
            height={50}
            borderRadius={50}
          />
        </View>
        <View ml={10} maxWidth="75%" justifyContent="center">
          <Text fs={16}>
            {supplier.supplier.name.replace("Distribuidora", "")}
          </Text>
          <View flexDirection="row" alignItems="center">
            <Icons color="orange" name="star"></Icons>
            <Text pl={4}>{supplier.supplier.star}</Text>
          </View>
        </View>
      </View>
      <View justifyContent="center">
        <View>
          <Text textAlign="right" fontSize={16} fontWeight="800">
            R${" "}
            {supplier.supplier.discount.orderValueFinish
              .toFixed(2)
              .replace(".", ",")}
          </Text>
          {available ? (
            <Text
              color={
                supplier.supplier.discount.product.length -
                  supplier.supplier.missingItens >
                0
                  ? "red"
                  : "black"
              }
              fontSize={12}
            >
              {supplier.supplier.discount.product.length -
                supplier.supplier.missingItens}{" "}
              iten(s) faltante(s)
            </Text>
          ) : isOpen() ? (
            <Text color="red" fontSize={12}>
              Fechado às {supplier.supplier.hour.substring(0, 5)}
            </Text>
          ) : (
            <Text color="red" fontSize={12}>
              Mínimo R$
              {supplier.supplier.minimumOrder.toFixed(2).replace(".", ",")}
            </Text>
          )}
        </View>
      </View>
      <View pl={10} justifyContent="center">
        {!available && supplier.supplier.missingItens < 1 ? (
          <View></View>
        ) : (
          <Icons name="chevron-forward" size={24}></Icons>
        )}
      </View>
    </View>
  );
};

export function Prices({ navigation }: HomeScreenProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [unavailableSupplier, setUnavailableSupplier] = useState<
    SupplierData[]
  >([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>();
  const [showRestInfo, setShowRestInfo] = useState<boolean>(false);
  const [minhours, setMinhours] = useState<string[]>([]);
  const [maxhours, setMaxhours] = useState<string[]>([]);
  const [minHour, setMinHour] = useState<string>("");
  const [maxHour, setMaxHour] = useState<string>("");
  const [editInfos, setEditInfos] = useState<boolean>(false);
  const [allRestaurants, setAllRestaurants] = useState<SelectItem[]>([]);
  const [city, setCity] = useState<string>();
  const [zipCode, setZipCode] = useState<string>();
  const [localType, setLocalType] = useState<string>();
  const [street, setStreet] = useState<string>();
  const [localNumber, setLocalNumber] = useState<string>();
  const [neighborhood, setNeighborhood] = useState<string>();
  const [responsibleReceivingName, setResponsibleReceivingName] =
    useState<string>();
  const [responsibleReceivingPhoneNumber, setResponsibleReceivingPhoneNumber] =
    useState<string>();
  const [deliveryInformation, setDeliveryInformation] = useState<string>();
  const [complement, setComplement] = useState<string>();
  const [tab, setTab] = useState<string>("onlySupplier");
  const [finalCotacao, setFinalCotacao] = useState<boolean>(false);
  const [minHourOpen, setMinHourOpen] = useState(false);
  const [maxHourOpen, setMaxHourOpen] = useState(false);
  const [restOpen, setRestOpen] = useState(false);
  const [localTypeOpen, setLocalTypeOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const screemSize = useScreenSize();

  const handleConfirm = () => {
    setFinalCotacao(true);
    clearStorage();
    setTimeout(() => {
      navigation.replace("Products");
    }, 1000);
  };

  const handleSelectedRest = async (rest: any) => {
    console.log("restaurante<><><>", rest);
    setSelectedRestaurant(rest);
    updateAddress(rest);
  };

  useEffect(() => {
    if (minHour) {
      let [minHourValue, minMinuteValue] = minHour.split(":").map(Number);
      let [currentMaxHourValue, currentMaxMinuteValue] = maxHour
        ? maxHour.split(":").map(Number)
        : [0, 0];

      // Adiciona 1h30m à minHour
      let hour = minHourValue + 1;
      let minute = minMinuteValue + 30;
      if (minute >= 60) {
        minute -= 60;
        hour += 1;
      }

      // Verifica se o maxHour existente é menor que o novo tempo
      const newMaxInMinutes = hour * 60 + minute;
      const currentMaxInMinutes =
        currentMaxHourValue * 60 + currentMaxMinuteValue;

      if (currentMaxInMinutes < newMaxInMinutes) {
        // Atualiza maxHour se o valor atual for menor que o novo calculado
        const updatedMaxHour = `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`;
        setMaxHour(updatedMaxHour);
      }

      // Gera as opções para maxHour
      const maxOptions = [];
      hour = minHourValue + 1; // Reinicializa o valor de hour para começar a partir do minHour + 1h30m
      minute = minMinuteValue + 30;
      if (minute >= 60) {
        minute -= 60;
        hour += 1;
      }

      while (hour < 24) {
        maxOptions.push(
          `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
        );
        minute += 30;
        if (minute >= 60) {
          minute -= 60;
          hour += 1;
        }
      }

      setMaxhours(maxOptions);
    } else {
      setMaxhours([]);
    }
  }, [minHour, maxHour]); // Remove maxHour da lista de dependências para evitar loop infinito

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChangeAddress = (
    minHour: string,
    maxHour: string,
    neigh: string
  ) => {
    let newValue;
    setSelectedRestaurant((prevValue: any) => {
      newValue = prevValue;
      newValue.addressInfos[0].initialDeliveryTime = `2024-01-01T${minHour}:00.000Z`;
      newValue.addressInfos[0].finalDeliveryTime = `2024-01-01T${maxHour}:00.000Z`;
      return newValue;
    });
    updateAddress(newValue);
  };

  const goToConfirm = async (
    supplier: SupplierData,
    selectedRestaurant: any
  ) => {
    try {
      setLoading(true);
      await setStorage("supplierSelected", JSON.stringify(supplier));
      await setStorage(
        "selectedRestaurant",
        JSON.stringify({ restaurant: selectedRestaurant })
      );
      navigation.replace("Confirm");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPrices = useCallback(async (selectedRestaurant?: any) => {
    try {
      const token = await getToken();
      if (!token) return new Map();

      const result = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/price/list`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            selectedRestaurant: selectedRestaurant ?? items[0],
          }),
        }
      );

      const response = await result.json();

      const currentDate = DateTime.now().setZone("America/Sao_Paulo");
      const currentHour = Number(
        `${currentDate.hour.toString().padStart(2, "0")}${currentDate.minute
          .toString()
          .padStart(2, "0")}${currentDate.second.toString().padStart(2, "0")}`
      );
      const supplier = (response.data as SupplierData[]).filter((item) => {
        return (
          Number(item.supplier.hour.replaceAll(":", "")) >= currentHour &&
          item.supplier.minimumOrder <=
            item.supplier.discount.orderValueFinish &&
          item.supplier.missingItens > 0
        );
      });

      const supplierUnavailable = (response.data as SupplierData[]).filter(
        (item) =>
          (Number(item.supplier.hour.replaceAll(":", "")) < currentHour ||
            item.supplier.minimumOrder >
              item.supplier.discount.orderValueFinish) &&
          item.supplier.missingItens > 0
      );
      const sortedSuppliers = supplier.sort((a, b) => {
        const diffA =
          a.supplier.discount.product.length - a.supplier.missingItens;
        const diffB =
          b.supplier.discount.product.length - b.supplier.missingItens;

        if (diffA !== diffB) {
          return diffA - diffB;
        }

        const notaA =
          a.supplier.star === "(NOVO)" ? 0 : Number(a.supplier.star);
        const notaB =
          b.supplier.star === "(NOVO)" ? 0 : Number(b.supplier.star);

        if (notaA !== notaB) {
          return notaB - notaA;
        }

        return (
          a.supplier.discount.orderValueFinish -
          b.supplier.discount.orderValueFinish
        );
      });

      const sortedUnavailableSuppliers = supplierUnavailable.sort((a, b) => {
        const hourA = Number(a.supplier.hour.replaceAll(":", ""));
        const hourB = Number(b.supplier.hour.replaceAll(":", ""));

        if (hourA !== hourB) {
          return hourB - hourA;
        }

        const diffA =
          a.supplier.discount.product.length - a.supplier.missingItens;
        const diffB =
          b.supplier.discount.product.length - b.supplier.missingItens;

        if (diffA !== diffB) {
          return diffA - diffB;
        }

        const notaA =
          a.supplier.star === "(NOVO)" ? 0 : Number(a.supplier.star);
        const notaB =
          b.supplier.star === "(NOVO)" ? 0 : Number(b.supplier.star);

        if (notaA !== notaB) {
          return notaB - notaA;
        }

        return (
          a.supplier.discount.orderValueFinish -
          b.supplier.discount.orderValueFinish
        );
      });

      setSuppliers(sortedSuppliers);
      setUnavailableSupplier(sortedUnavailableSuppliers);
    } catch (error) {
      console.error("Error loading product:", error);
    }
  }, []);

  const loadPricesAux = useCallback(async (rest: any) => {
    try {
      const token = await getToken();
      if (!token) return new Map();

      const result = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/price/list`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, selectedRestaurant: rest }),
        }
      );
      const response = await result.json();
      const currentDate = DateTime.now().setZone("America/Sao_Paulo");
      const currentHour = Number(
        `${currentDate.hour.toString().padStart(2, "0")}${currentDate.minute
          .toString()
          .padStart(2, "0")}${currentDate.second.toString().padStart(2, "0")}`
      );
      const supplier = (response.data as SupplierData[]).filter((item) => {
        return (
          Number(item.supplier.hour.replaceAll(":", "")) >= currentHour &&
          item.supplier.minimumOrder <=
            item.supplier.discount.orderValueFinish &&
          item.supplier.missingItens > 0
        );
      });
      const supplierUnavailable = (response.data as SupplierData[]).filter(
        (item) =>
          (Number(item.supplier.hour.replaceAll(":", "")) < currentHour ||
            item.supplier.minimumOrder >
              item.supplier.discount.orderValueFinish) &&
          item.supplier.missingItens > 0
      );
      const sortedSuppliers = supplier.sort((a, b) => {
        const diffA =
          a.supplier.discount.product.length - a.supplier.missingItens;
        const diffB =
          b.supplier.discount.product.length - b.supplier.missingItens;

        if (diffA !== diffB) {
          return diffA - diffB;
        }

        const notaA =
          a.supplier.star === "(NOVO)" ? 0 : Number(a.supplier.star);
        const notaB =
          b.supplier.star === "(NOVO)" ? 0 : Number(b.supplier.star);

        if (notaA !== notaB) {
          return notaB - notaA;
        }

        return (
          a.supplier.discount.orderValueFinish -
          b.supplier.discount.orderValueFinish
        );
      });

      const sortedUnavailableSuppliers = supplierUnavailable.sort((a, b) => {
        const hourA = Number(a.supplier.hour.replaceAll(":", ""));
        const hourB = Number(b.supplier.hour.replaceAll(":", ""));

        if (hourA !== hourB) {
          return hourB - hourA;
        }

        const diffA =
          a.supplier.discount.product.length - a.supplier.missingItens;
        const diffB =
          b.supplier.discount.product.length - b.supplier.missingItens;

        if (diffA !== diffB) {
          return diffA - diffB;
        }

        const notaA =
          a.supplier.star === "(NOVO)" ? 0 : Number(a.supplier.star);
        const notaB =
          b.supplier.star === "(NOVO)" ? 0 : Number(b.supplier.star);

        if (notaA !== notaB) {
          return notaB - notaA;
        }

        return (
          a.supplier.discount.orderValueFinish -
          b.supplier.discount.orderValueFinish
        );
      });

      setSuppliers(sortedSuppliers);
      setUnavailableSupplier(sortedUnavailableSuppliers);
    } catch (error) {
      console.error("Error loading product:", error);
    }
  }, []);

  useEffect(() => {
    const loadPricesAsync = async () => {
      try {
        const restaurants = await loadRestaurants();
        items = restaurants;
        console.log(items[0]);
        setMinHour(
          items[0]?.addressInfos[0]?.initialDeliveryTime.substring(11, 15)
        );
        setSelectedRestaurant(items[0]);
        setTab(items[0].premium ? "plus" : "onlySupplier");
        setAllRestaurants(items);
        await loadPrices();
        const hours = [];
        for (let hour = 0; hour < 22; hour++) {
          hours.push(`${String(hour).padStart(2, "0")}:00`);
          hours.push(`${String(hour).padStart(2, "0")}:30`);
        }
        hours.push("22:00");
        setMinhours(hours);
        setMinHour(
          items[0]?.addressInfos[0]?.initialDeliveryTime.substring(11, 16)
        );
        setMaxHour(
          items[0]?.addressInfos[0]?.finalDeliveryTime.substring(11, 16)
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPricesAsync();
  }, [loadPrices]);

  const updateAddress = async (rest: any) => {
    try {
      setLoading(true);
      setMinHour(rest?.addressInfos[0]?.initialDeliveryTime.substring(11, 15));
      setSelectedRestaurant(rest);
      await loadPricesAux(rest);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const combinedSuppliers = useMemo(() => {
    const itens: any[] = [];

    const filteredSuppliers = suppliers.filter(
      (item) => item.supplier.hour.substring(0, 5) !== "06:00"
    );

    const filteredUnavailableSuppliers = unavailableSupplier.filter(
      (item) => item.supplier.hour.substring(0, 5) !== "06:00"
    );

    if (filteredSuppliers.length) itens.push({ initialSeparator: true });
    itens.push(
      ...filteredSuppliers.map((item) => ({ ...item, available: true }))
    );

    if (filteredUnavailableSuppliers.length) itens.push({ separator: true });
    itens.push(
      ...filteredUnavailableSuppliers.map((item) => ({
        ...item,
        available: false,
      }))
    );

    return itens;
  }, [suppliers, unavailableSupplier]);

  useEffect(() => {
    if (selectedRestaurant) {
      const addressInfo =
        selectedRestaurant.addressInfos && selectedRestaurant.addressInfos[0];

      setTab(selectedRestaurant.premium ? "plus" : "onlySupplier");

      if (addressInfo) {
        setNeighborhood(addressInfo.neighborhood);
        setCity(addressInfo.city);
        setLocalType(addressInfo.localType);
        setLocalNumber(addressInfo.localNumber);
        setResponsibleReceivingName(addressInfo.responsibleReceivingName);
        setResponsibleReceivingPhoneNumber(
          addressInfo.responsibleReceivingPhoneNumber
        );
        setZipCode(
          addressInfo.zipCode
            .replace(/\D/g, "")
            .replace(/(\d{5})(\d{3})/, "$1-$2")
        );
        setStreet(addressInfo.address);
        setComplement(addressInfo.complement);
        setDeliveryInformation(addressInfo.deliveryInformation);
        setMaxHour(addressInfo.finalDeliveryTime.substring(11, 16));
        setMinHour(addressInfo.initialDeliveryTime.substring(11, 16));
      } else {
        console.log("Address info not found for the selected restaurant");
      }

      setLoading(false);
    }
  }, [selectedRestaurant]);

  const getItem = (data: SupplierData[], index: number) => data[index];
  const getItemCount = (data: SupplierData[]) => data.length;
  const renderItem = ({ item }: { item: any }) => {
    if (item.separator) {
      return (
        <Text pb={10} pt={10} opacity={60} fontSize={16}>
          Fornecedores indisponíveis
        </Text>
      );
    }
    if (item.initialSeparator) {
      return (
        <Text pb={5} opacity={60} mt={10} fontSize={16}>
          Fornecedores disponíveis
        </Text>
      );
    }
    return (
      <SupplierBox
        supplier={item}
        star={item.star}
        available={item.available}
        selectedRestaurant={selectedRestaurant}
        goToConfirm={goToConfirm}
      />
    );
  };

  const validateFields = () => {
    const fieldLabels: { [key: string]: string } = {
      zipCode: "CEP",
      localNumber: "Número",
      street: "Rua",
      responsibleReceivingName: "Nome do responsável",
      responsibleReceivingPhoneNumber: "Telefone do responsável",
      localType: "Logradouro",
      city: "Cidade",
      neighborhood: "Bairro",
    };
    const fields: Record<string, string | undefined> = {
      zipCode,
      localNumber,
      street,
      responsibleReceivingName,
      responsibleReceivingPhoneNumber,
      localType,
      city,
      neighborhood,
    };
    const requiredFields = Object.values(fields);
    const isValid = requiredFields.every((field) => field?.trim());
    if (!isValid) {
      const emptyFields = Object.keys(fields).filter(
        (key) => !fields[key]?.trim()
      );
      setMissingFields(emptyFields.map((key) => fieldLabels[key]));
      setIsAlertVisible(true);
    }
    return isValid;
  };

  if (finalCotacao) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
        <Text fontSize={12} mt={5} color="gray" textAlign="center">
          Cotação solicitada, fique de olho no Whatsapp
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    );
  }

  return (
    <Stack pt={20} backgroundColor="white" height="100%" position="relative">
      <View height={50} flex={1} paddingTop={20}>
        <View
          pb={20}
          alignItems="center"
          paddingLeft={20}
          paddingRight={20}
          flexDirection="row"
        >
          <Icons
            onPress={() => {
              navigation.replace("Cart");
            }}
            size={25}
            name="chevron-back"
          ></Icons>
          <Text f={1} textAlign="center" fontSize={20}>
            Cotações
          </Text>
        </View>
        <View
          borderRadius={50}
          flexDirection="row"
          justifyContent="space-between"
          height={50}
        >
          <View
            disabled={!selectedRestaurant.premium}
            opacity={selectedRestaurant.premium ? 1 : 0.4}
            onPress={() => {
              setTab("plus");
            }}
            cursor="pointer"
            hoverStyle={{ opacity: 0.75 }}
            flex={1}
            alignItems="center"
            justifyContent="center"
          >
            <Text color={tab === "plus" ? "#04BF7B" : "gray"}>Conéctar+</Text>
            <View
              mt={10}
              h={1}
              width="100%"
              backgroundColor={tab === "plus" ? "#04BF7B" : "white"}
            ></View>
          </View>
          <View
            onPress={() => {
              setTab("onlySupplier");
            }}
            cursor="pointer"
            hoverStyle={{ opacity: 0.75 }}
            flex={1}
            alignItems="center"
            justifyContent="center"
          >
            <Text color={tab === "plus" ? "gray" : "#04BF7B"}>
              Por fornecedor
            </Text>
            <View
              mt={10}
              h={1}
              width="100%"
              backgroundColor={tab === "plus" ? "white" : "#04BF7B"}
            ></View>
          </View>
        </View>

        <View backgroundColor="white" flex={1} paddingHorizontal={5}>
          <View p={10} paddingTop={0} height="100%">
            {tab === "onlySupplier" && (
              <VirtualizedList
                style={{ marginBottom: 5, flexGrow: 1 }}
                data={combinedSuppliers}
                getItemCount={getItemCount}
                getItem={getItem}
                keyExtractor={(item, index) =>
                  item.supplier ? item.supplier.name : `separator-${index}`
                }
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View height={2} />}
                initialNumToRender={10}
                windowSize={4}
                scrollEnabled={true}
              />
            )}
            {tab !== "onlySupplier" && (
              <View p={20} mt={10}>
                <DialogInstanceNotification
                  openModal={showNotification}
                  setOpenModal={setShowNotification}
                  title="Pronto!"
                  subtitle="Cotação solicitada."
                  description="Seu pedido foi enviado para o seu Whatsapp, retornaremos com sua cotação."
                  buttonText="Ok"
                  onConfirm={handleConfirm}
                />

                <Button
                  backgroundColor="#04BF7B"
                  onPress={async () => {
                    if (!validateFields()) return;

                    setLoading(true);
                    const result = await fetch(
                      `${process.env.EXPO_PUBLIC_API_URL}/confirm/premium`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          token: await getToken(),
                          selectedRestaurant: selectedRestaurant,
                        }),
                      }
                    );

                    console.log(
                      JSON.stringify({
                        token: await getToken(),
                        selectedRestaurant: selectedRestaurant,
                      })
                    );

                    if (result.ok) {
                      const teste = await result.json();
                      console.log(teste);
                      setLoading(false);
                      setShowNotification(true);
                    } else {
                      const teste = await result.json();
                      console.log(teste);
                      setLoading(false);
                    }
                  }}
                >
                  <Text fontWeight="500" fontSize={16} color="white">
                    Solicitar cotação
                  </Text>
                </Button>
                <Text mt={5} textAlign="center" fontSize={12} color="gray">
                  Você receberá a cotação no Whatsapp
                </Text>
              </View>
            )}
          </View>
        </View>
        <View
          onPress={() => {
            setNeighborhood(selectedRestaurant.addressInfos[0].neighborhood);
            setCity(selectedRestaurant.addressInfos[0].city);
            setLocalType(selectedRestaurant.addressInfos[0].localType);
            setLocalNumber(selectedRestaurant.addressInfos[0].localNumber);
            setResponsibleReceivingName(
              selectedRestaurant.addressInfos[0].responsibleReceivingName
            );
            setResponsibleReceivingPhoneNumber(
              selectedRestaurant.addressInfos[0].responsibleReceivingPhoneNumber
            );
            setZipCode(
              selectedRestaurant.addressInfos[0].zipCode
                .replace(/\D/g, "")
                .replace(/(\d{5})(\d{3})/, "$1-$2")
            );
            setStreet(selectedRestaurant.addressInfos[0].address);
            setComplement(selectedRestaurant.addressInfos[0].complement);
            setDeliveryInformation(
              selectedRestaurant.addressInfos[0].deliveryInformation
            );
            setEditInfos(true);
          }}
          backgroundColor="white"
          paddingBottom={10}
          paddingTop={10}
          paddingHorizontal={20}
          borderTopColor="lightgray"
          borderTopWidth={1}
        >
          <View flexDirection="row" alignItems="center">
            <View
              p={10}
              mr={10}
              flexDirection="row"
              f={1}
              borderColor="lightgray"
              borderRadius={5}
              borderWidth={1}
              paddingHorizontal={10}
              backgroundColor="white"
              alignItems="center"
            >
              <Icons size={20} color="#04BF7B" name="storefront"></Icons>
              <View ml={20}></View>
              <Text
                numberOfLines={showRestInfo ? 1 : 1}
                ellipsizeMode="tail"
                fontSize={12}
                style={{ flexShrink: 1, width: "100%" }}
              >
                {selectedRestaurant?.name || ""}
              </Text>
            </View>
            <View
              p={10}
              mr={10}
              flexDirection="row"
              f={1}
              borderColor="lightgray"
              borderRadius={5}
              borderWidth={1}
              paddingHorizontal={10}
              backgroundColor="white"
              alignItems="center"
            >
              <Icons size={20} color="#04BF7B" name="time"></Icons>
              <View ml={20}></View>
              <Text fontSize={12}>
                {selectedRestaurant.addressInfos[0].initialDeliveryTime.substring(
                  11,
                  16
                )}{" "}
                -{" "}
                {selectedRestaurant.addressInfos[0].finalDeliveryTime.substring(
                  11,
                  16
                )}
              </Text>
            </View>
            <Icons
              size={20}
              onPress={() => {
                setShowRestInfo(!showRestInfo);
              }}
              name={showRestInfo ? "chevron-up" : "chevron-down"}
            ></Icons>
          </View>
          <View display={showRestInfo ? "flex" : "none"}>
            <View pt={5} flexDirection="row" alignItems="center">
              <View
                p={10}
                mr={10}
                flexDirection="row"
                f={1}
                borderColor="lightgray"
                borderRadius={5}
                borderWidth={1}
                paddingHorizontal={10}
                backgroundColor="white"
                alignItems="center"
              >
                <Icons size={20} color="#04BF7B" name="location"></Icons>
                <View ml={20}></View>
                <Text
                  numberOfLines={1}
                  overflow="scroll"
                  ellipsizeMode="tail"
                  fontSize={12}
                >
                  {selectedRestaurant.addressInfos[0].localType}{" "}
                  {selectedRestaurant.addressInfos[0].address},{" "}
                  {selectedRestaurant.addressInfos[0].localNumber}.{" "}
                  {selectedRestaurant.addressInfos[0].complement} -{" "}
                  {selectedRestaurant.addressInfos[0].neighborhood},{" "}
                  {selectedRestaurant.addressInfos[0].city}
                </Text>
              </View>
              <View
                p={10}
                mr={10}
                flexDirection="row"
                f={1}
                borderColor="lightgray"
                borderRadius={5}
                borderWidth={1}
                paddingHorizontal={10}
                backgroundColor="white"
                alignItems="center"
              >
                <Icons size={20} color="#04BF7B" name="chatbox"></Icons>
                <View ml={20}></View>
                <Text fontSize={12}>
                  {selectedRestaurant.addressInfos[0].deliveryInformation}
                </Text>
              </View>
            </View>
            <View pt={5} flexDirection="row" alignItems="center">
              <View
                p={10}
                mr={10}
                flexDirection="row"
                f={1}
                borderColor="lightgray"
                borderRadius={5}
                borderWidth={1}
                paddingHorizontal={10}
                backgroundColor="white"
                alignItems="center"
              >
                <Icons size={20} color="#04BF7B" name="person"></Icons>
                <View ml={20}></View>
                <Text fontSize={12}>
                  {selectedRestaurant.addressInfos[0].responsibleReceivingName}
                </Text>
              </View>
              <View
                p={10}
                mr={10}
                flexDirection="row"
                f={1}
                borderColor="lightgray"
                borderRadius={5}
                borderWidth={1}
                paddingHorizontal={10}
                backgroundColor="white"
                alignItems="center"
              >
                <Icons size={20} color="#04BF7B" name="call"></Icons>
                <View ml={20}></View>
                <Text fontSize={12}>
                  {
                    selectedRestaurant.addressInfos[0]
                      .responsibleReceivingPhoneNumber
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>
        {editInfos && (
          <View
            flex={1}
            justifyContent="center"
            alignItems="center"
            backgroundColor="white"
          >
            <Modal transparent={true}>
              <ScrollView
                contentContainerStyle={{
                  flex: 1,
                  justifyContent: "center",
                  padding: 20,
                }}
                keyboardShouldPersistTaps="handled"
              >
                <View
                  flex={1}
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor="rgba(0, 0, 0, 0.9)"
                >
                  <View
                    pb={15}
                    paddingHorizontal={15}
                    pt={15}
                    $xl={{ minWidth: "40%" }}
                    $sm={{ minWidth: "90%" }}
                    backgroundColor="white"
                    borderRadius={10}
                    justifyContent="center"
                    zIndex={101}
                  >
                    <Text pl={5} fontSize={12} color="gray">
                      Restaurante
                    </Text>
                    {allRestaurants.length > 0 ? (
                      <DropDownPicker
                        listMode="SCROLLVIEW"
                        value={selectedRestaurant?.name}
                        style={{
                          borderWidth: 1,
                          borderColor: "lightgray",
                          borderRadius: 5,
                          flex: 1,
                          marginBottom: Platform.OS === "web" ? 0 : 35,
                        }}
                        setValue={() => {}}
                        items={allRestaurants.map((item) => ({
                          label: item?.name,
                          value: item?.name,
                        }))}
                        multiple={false}
                        open={restOpen}
                        setOpen={setRestOpen}
                        placeholder=""
                        onSelectItem={(value) => {
                          setLoading(true); // Ativa o loading assim que o usuário escolhe um item
                          const rest = allRestaurants.find(
                            (item) => item?.name === value.value
                          );
                          setSelectedRestaurant(rest); // Atualiza o restaurante selecionado
                        }}
                      ></DropDownPicker>
                    ) : (
                      <Text>Loading...</Text> // Ou algum placeholder
                    )}
                    <View
                      pt={15}
                      gap={10}
                      mb={Platform.OS === "web" ? 0 : 35}
                      justifyContent="space-between"
                      flexDirection="row"
                      zIndex={100}
                    >
                      <View flex={1}>
                        <Text pl={5} fontSize={12} color="gray">
                          A partir de
                        </Text>
                        <DropDownPicker
                          value={minHour}
                          style={{
                            borderWidth: 1,
                            borderColor: "lightgray",
                            borderRadius: 5,
                            flex: 1,
                          }}
                          setValue={setMinHour}
                          items={minhours.map((item) => {
                            return { label: item, value: item };
                          })}
                          multiple={false}
                          open={minHourOpen}
                          setOpen={setMinHourOpen}
                          placeholder=""
                          listMode="SCROLLVIEW"
                        ></DropDownPicker>
                      </View>
                      <View flex={1} zIndex={100}>
                        <Text pl={5} fontSize={12} color="gray">
                          Até
                        </Text>
                        <DropDownPicker
                          value={maxHour}
                          listMode="SCROLLVIEW"
                          style={{
                            borderWidth: 1,
                            borderColor: "lightgray",
                            borderRadius: 5,
                            flex: 1,
                          }}
                          setValue={setMaxHour}
                          items={maxhours.map((item) => {
                            return { label: item, value: item };
                          })}
                          multiple={false}
                          open={maxHourOpen}
                          setOpen={setMaxHourOpen}
                          placeholder=""
                        ></DropDownPicker>
                      </View>
                    </View>
                    <KeyboardAvoidingView>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 10,
                          marginBottom: 15,
                        }}
                      >
                        {/* Campo CEP */}
                        <View style={{ flex: 1, width: 110 }}>
                          <Text
                            style={{
                              paddingTop: 15,
                              paddingLeft: 5,
                              fontSize: 12,
                              color: "gray",
                            }}
                          >
                            Cep
                          </Text>
                          <Input
                            height={50}
                            maxLength={9}
                            backgroundColor="white"
                            borderColor="lightgray"
                            borderRadius={5}
                            onChangeText={async (value) => {
                              const cleaned = value.replace(/\D/g, "");
                              const formatted = cleaned.replace(
                                /(\d{5})(\d{3})/,
                                "$1-$2"
                              );

                              if (formatted.length === 9) {
                                setLoading(true);
                                const response = await fetch(
                                  `https://viacep.com.br/ws/${cleaned}/json/`
                                );
                                const result = await response.json();
                                if (response.ok && !result.erro) {
                                  setCity(result.localidade.toUpperCase());
                                  setNeighborhood(result.bairro.toUpperCase());
                                  setLocalType(
                                    result.logradouro
                                      .split(" ")[0]
                                      .toUpperCase()
                                  );
                                  setLocalNumber("");
                                  setStreet(
                                    result.logradouro
                                      .split(" ")
                                      .slice(1)
                                      .join(" ")
                                      .toUpperCase()
                                  );
                                }
                                setLoading(false);
                              }

                              setZipCode(formatted);
                            }}
                            value={zipCode}
                          />
                        </View>

                        {/* Campo Logradouro */}
                        <View style={{ flex: 1, zIndex: 10 }}>
                          <Text
                            style={{
                              paddingTop: 15,
                              paddingLeft: 5,
                              fontSize: 12,
                              color: "gray",
                            }}
                          >
                            Logradouro
                          </Text>
                          <DropDownPicker
                            value={localType ?? "RUA"}
                            style={{
                              borderWidth: 1,
                              borderColor: "lightgray",
                              borderRadius: 5,
                            }}
                            dropDownContainerStyle={{
                              position: "absolute",
                              top: 50, // Ajuste para evitar sobreposição
                            }}
                            listMode="SCROLLVIEW"
                            setValue={setLocalType}
                            items={[
                              { label: "ALAMEDA", value: "ALAMEDA" },
                              { label: "AVENIDA", value: "AVENIDA" },
                              { label: "BECO", value: "BECO" },
                              { label: "BOULEVARD", value: "BOULEVARD" },
                              { label: "CAMINHO", value: "CAMINHO" },
                              { label: "CHÁCARA", value: "CHÁCARA" },
                              { label: "CIRCUITO", value: "CIRCUITO" },
                              { label: "CONJUNTO", value: "CONJUNTO" },
                              { label: "EIXO", value: "EIXO" },
                              { label: "ESTAÇÃO", value: "ESTAÇÃO" },
                              { label: "ESTRADA", value: "ESTRADA" },
                              { label: "FAVELA", value: "FAVELA" },
                              { label: "JARDIM", value: "JARDIM" },
                              { label: "LADEIRA", value: "LADEIRA" },
                              { label: "LARGO", value: "LARGO" },
                              { label: "PARQUE", value: "PARQUE" },
                              { label: "PASSARELA", value: "PASSARELA" },
                              { label: "PASSEIO", value: "PASSEIO" },
                              { label: "PRAÇA", value: "PRAÇA" },
                              { label: "QUADRA", value: "QUADRA" },
                              { label: "RAMPA", value: "RAMPA" },
                              { label: "RODOVIA", value: "RODOVIA" },
                              { label: "RUA", value: "RUA" },
                              { label: "TRAVESSA", value: "TRAVESSA" },
                              { label: "VIA", value: "VIA" },
                              { label: "VIADUTO", value: "VIADUTO" },
                              { label: "VIELA", value: "VIELA" },
                              { label: "VILA", value: "VILA" },
                            ]}
                            multiple={false}
                            open={localTypeOpen}
                            setOpen={setLocalTypeOpen}
                            placeholder=""
                          />
                        </View>
                      </View>
                    </KeyboardAvoidingView>

                    <View
                      zIndex={-1}
                      flexDirection="column"
                      gap={Platform.OS === "web" ? 10 : 50}
                    >
                      <KeyboardAvoidingView>
                        <Input
                          onChangeText={(value) => {
                            const formattedValue = value.replace(
                              /[^A-Za-z\s]/g,
                              ""
                            );
                            setStreet(formattedValue);
                          }}
                          $sm={{ marginTop: 10 }}
                          backgroundColor="white"
                          borderColor="lightgray"
                          borderRadius={5}
                          borderTopLeftRadius={0}
                          borderBottomLeftRadius={0}
                          value={street}
                          focusStyle={{
                            borderColor: "#049A63",
                            borderWidth: 1,
                          }}
                          hoverStyle={{
                            borderColor: "#049A63",
                            borderWidth: 1,
                          }}
                        />
                      </KeyboardAvoidingView>
                    </View>
                    {screemSize === "xl" ? (
                      <>
                        <View
                          zIndex={-1}
                          height={70}
                          mb={5}
                          pt={10}
                          gap={5}
                          justifyContent="space-between"
                          $sm={{ flexDirection: "column" }}
                          $xl={{ flexDirection: "row" }}
                        >
                          <View flex={1}>
                            <KeyboardAvoidingView style={{ width: 100 }}>
                              <Text pl={5} fontSize={12} color="gray">
                                Nº
                              </Text>
                              <Input
                                height={43}
                                fontSize={14}
                                flex={1}
                                backgroundColor="white"
                                borderColor="lightgray"
                                borderRadius={5}
                                value={localNumber}
                                keyboardType="numeric"
                                onChangeText={(value) => {
                                  const formattedValue = value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );
                                  setLocalNumber(formattedValue);
                                }}
                                focusStyle={{
                                  borderColor: "#049A63",
                                  borderWidth: 1,
                                }}
                                hoverStyle={{
                                  borderColor: "#049A63",
                                  borderWidth: 1,
                                }}
                              />
                            </KeyboardAvoidingView>
                          </View>

                          <View flex={1}>
                            <KeyboardAvoidingView style={{ width: 100 }}>
                              <Text pl={5} fontSize={12} color="gray">
                                Complemento
                              </Text>
                              <Input
                                fontSize={14}
                                flex={1}
                                backgroundColor="white"
                                borderColor="lightgray"
                                borderRadius={5}
                                value={complement}
                                onChangeText={(value) => {
                                  setComplement(value);
                                }}
                                focusStyle={{
                                  borderColor: "#049A63",
                                  borderWidth: 1,
                                }}
                                hoverStyle={{
                                  borderColor: "#049A63",
                                  borderWidth: 1,
                                }}
                              />
                            </KeyboardAvoidingView>
                          </View>

                          <View
                            zIndex={-1}
                            flex={1}
                            $sm={{ flexDirection: "column" }}
                          >
                            <KeyboardAvoidingView style={{ width: 300 }}>
                              <Text pl={5} fontSize={12} color="gray">
                                Bairro
                              </Text>
                              <Input
                                color="gray"
                                fontSize={12}
                                disabled
                                flex={1}
                                backgroundColor="white"
                                borderColor="lightgray"
                                borderRadius={5}
                                value={neighborhood}
                                focusStyle={{
                                  borderColor: "#049A63",
                                  borderWidth: 1,
                                }}
                                hoverStyle={{
                                  borderColor: "#049A63",
                                  borderWidth: 1,
                                }}
                              />
                            </KeyboardAvoidingView>
                          </View>
                        </View>
                        <View
                          zIndex={-1}
                          flex={1}
                          $sm={{ flexDirection: "column" }}
                        >
                          <KeyboardAvoidingView style={{ flex: 1 }}>
                            <Text pl={5} fontSize={12} color="gray">
                              Cidade
                            </Text>
                            <Input
                              $sm={{ height: 30 }}
                              color="gray"
                              fontSize={12}
                              disabled
                              flex={1}
                              backgroundColor="white"
                              borderColor="lightgray"
                              borderRadius={5}
                              value={city}
                              focusStyle={{
                                borderColor: "#049A63",
                                borderWidth: 1,
                              }}
                              hoverStyle={{
                                borderColor: "#049A63",
                                borderWidth: 1,
                              }}
                            />
                          </KeyboardAvoidingView>
                        </View>
                      </>
                    ) : (
                      <>
                        <View
                          height={70}
                          pt={15}
                          gap={10}
                          justifyContent="space-between"
                          flexDirection="row"
                        >
                          <View flex={1}>
                            <KeyboardAvoidingView style={{ flex: 1 }}>
                              <Text pl={5} fontSize={12} color="gray">
                                Nº
                              </Text>
                              <Input
                                fontSize={14}
                                flex={1}
                                backgroundColor="white"
                                borderColor="lightgray"
                                borderRadius={5}
                                value={localNumber}
                                keyboardType="numeric"
                                onChangeText={(value) => {
                                  const formattedValue = value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );
                                  setLocalNumber(formattedValue);
                                }}
                                focusStyle={{
                                  borderColor: "#049A63",
                                  borderWidth: 1,
                                }}
                                hoverStyle={{
                                  borderColor: "#049A63",
                                  borderWidth: 1,
                                }}
                              />
                            </KeyboardAvoidingView>
                          </View>

                          <View flex={1}>
                            <KeyboardAvoidingView style={{ flex: 1 }}>
                              <Text pl={5} fontSize={12} color="gray">
                                Complemento
                              </Text>
                              <Input
                                fontSize={14}
                                flex={1}
                                backgroundColor="white"
                                borderColor="lightgray"
                                borderRadius={5}
                                value={complement}
                                onChangeText={(value) => {
                                  setComplement(value);
                                }}
                                focusStyle={{
                                  borderColor: "#049A63",
                                  borderWidth: 1,
                                }}
                                hoverStyle={{
                                  borderColor: "#049A63",
                                  borderWidth: 1,
                                }}
                              />
                            </KeyboardAvoidingView>
                          </View>
                        </View>
                        <View
                          height={70}
                          pt={15}
                          gap={10}
                          justifyContent="space-between"
                          flexDirection="row"
                        >
                          <View flex={1}>
                            <KeyboardAvoidingView style={{ flex: 1 }}>
                              <Text pl={5} fontSize={12} color="gray">
                                Bairro
                              </Text>
                              <Input
                                color="gray"
                                fontSize={9}
                                disabled
                                flex={1}
                                backgroundColor="white"
                                borderColor="lightgray"
                                borderRadius={5}
                                value={neighborhood}
                                focusStyle={{
                                  borderColor: "#049A63",
                                  borderWidth: 1,
                                }}
                                hoverStyle={{
                                  borderColor: "#049A63",
                                  borderWidth: 1,
                                }}
                              />
                            </KeyboardAvoidingView>
                          </View>
                          <View flex={1}>
                            <KeyboardAvoidingView style={{ flex: 1 }}>
                              <Text pl={5} fontSize={12} color="gray">
                                Cidade
                              </Text>
                              <Input
                                color="gray"
                                fontSize={9}
                                disabled
                                flex={1}
                                backgroundColor="white"
                                borderColor="lightgray"
                                borderRadius={5}
                                value={city}
                                focusStyle={{
                                  borderColor: "#049A63",
                                  borderWidth: 1,
                                }}
                                hoverStyle={{
                                  borderColor: "#049A63",
                                  borderWidth: 1,
                                }}
                              />
                            </KeyboardAvoidingView>
                          </View>
                        </View>
                      </>
                    )}
                    <View
                      zIndex={-1}
                      height={70}
                      pt={15}
                      gap={10}
                      justifyContent="space-between"
                      flexDirection="row"
                    >
                      <View flex={1}>
                        <Text pl={5} fontSize={12} color="gray">
                          Resp. recebimento <Text color="red">*</Text>
                        </Text>
                        <KeyboardAvoidingView style={{ flex: 1 }}>
                          <Input
                            fontSize={14}
                            flex={1}
                            backgroundColor="white"
                            borderColor="lightgray"
                            borderRadius={5}
                            value={responsibleReceivingName}
                            onChangeText={(value) => {
                              // Remove todos os caracteres que não sejam letras ou espaços
                              const formattedValue = value.replace(
                                /[^A-Za-z\s]/g,
                                ""
                              );
                              setResponsibleReceivingName(formattedValue);
                            }}
                            focusStyle={{
                              borderColor: "#049A63",
                              borderWidth: 1,
                            }}
                            hoverStyle={{
                              borderColor: "#049A63",
                              borderWidth: 1,
                            }}
                          />
                        </KeyboardAvoidingView>
                      </View>
                      <View flex={1}>
                        <Text pl={5} fontSize={12} color="gray">
                          Cel Resp. recebimento <Text color="red">*</Text>
                        </Text>
                        <KeyboardAvoidingView style={{ flex: 1 }}>
                          <Input
                            maxLength={15}
                            fontSize={14}
                            flex={1}
                            backgroundColor="white"
                            borderColor="lightgray"
                            borderRadius={5}
                            value={responsibleReceivingPhoneNumber}
                            keyboardType="phone-pad"
                            focusStyle={{
                              borderColor: "#049A63",
                              borderWidth: 1,
                            }}
                            hoverStyle={{
                              borderColor: "#049A63",
                              borderWidth: 1,
                            }}
                            onChangeText={(value) => {
                              // Remove todos os caracteres que não sejam dígitos
                              let onlyNums = value.replace(/\D/g, "");

                              if (onlyNums.length > 10) {
                                // Formato moderno (celular): (XX) XXXXX-XXXX
                                onlyNums = onlyNums.replace(
                                  /(\d{2})(\d{5})(\d{0,4})/,
                                  "($1) $2-$3"
                                );
                              } else if (onlyNums.length > 6) {
                                // Formato convencional (fixo): (XX) XXXX-XXXX
                                onlyNums = onlyNums.replace(
                                  /(\d{2})(\d{4})(\d{0,4})/,
                                  "($1) $2-$3"
                                );
                              } else if (onlyNums.length > 2) {
                                // Formato parcial: (XX) XXXX
                                onlyNums = onlyNums.replace(
                                  /(\d{2})(\d{0,4})/,
                                  "($1) $2"
                                );
                              } else if (onlyNums.length > 0) {
                                // Formato parcial: (XX
                                onlyNums = onlyNums.replace(/(\d{0,2})/, "($1");
                              }

                              setResponsibleReceivingPhoneNumber(onlyNums);
                            }}
                          />
                        </KeyboardAvoidingView>
                      </View>
                    </View>
                    <View
                      height={70}
                      pt={15}
                      gap={5}
                      justifyContent="space-between"
                      flexDirection="row"
                    >
                      <View flex={1}>
                        <KeyboardAvoidingView style={{ flex: 1 }}>
                          <Text pl={5} fontSize={12} color="gray">
                            Info de entrega
                          </Text>
                          <Input
                            fontSize={14}
                            flex={1}
                            backgroundColor="white"
                            borderColor="lightgray"
                            borderRadius={5}
                            value={deliveryInformation}
                            onChangeText={(value) => {
                              setDeliveryInformation(value);
                            }}
                            focusStyle={{
                              borderColor: "#049A63",
                              borderWidth: 1,
                            }}
                            hoverStyle={{
                              borderColor: "#049A63",
                              borderWidth: 1,
                            }}
                          />
                        </KeyboardAvoidingView>
                      </View>
                    </View>
                    <View
                      height={70}
                      pt={15}
                      gap={5}
                      justifyContent="space-between"
                      flexDirection="row"
                    >
                      <Button
                        onPress={() => setEditInfos(false)}
                        backgroundColor="black"
                        flex={1}
                      >
                        <Text pl={5} fontSize={12} color="white">
                          Cancelar
                        </Text>
                      </Button>
                      <Button
                        {...(zipCode?.length === 9 &&
                        localNumber?.length &&
                        street?.length &&
                        responsibleReceivingName?.length &&
                        responsibleReceivingPhoneNumber?.length &&
                        localType?.length &&
                        city?.length
                          ? {}
                          : { opacity: 0.4, disabled: true })}
                        onPress={async () => {
                          if (!validateFields()) return; // Valida os campos antes de prosseguir

                          setLoading(true);
                          const rest: SelectItem = selectedRestaurant;
                          const addressInfo = rest.addressInfos[0];

                          addressInfo.neighborhood = neighborhood;
                          addressInfo.city = city;
                          addressInfo.localType = localType;
                          addressInfo.localNumber = localNumber;
                          addressInfo.responsibleReceivingName =
                            responsibleReceivingName;
                          addressInfo.responsibleReceivingPhoneNumber =
                            responsibleReceivingPhoneNumber;
                          addressInfo.zipCode = zipCode
                            ?.replaceAll(" ", "")
                            .replace("-", "");
                          addressInfo.address = street;
                          addressInfo.complement = complement;
                          addressInfo.deliveryInformation = deliveryInformation;
                          addressInfo.finalDeliveryTime = `1970-01-01T${maxHour}:00.000Z`;
                          addressInfo.initialDeliveryTime = `1970-01-01T${minHour}:00.000Z`;

                          setSelectedRestaurant(rest);

                          setStorage(
                            "selectedRestaurant",
                            JSON.stringify({ restaurant: rest })
                          );

                          await Promise.all([
                            loadPrices(rest),
                            fetch(
                              `${process.env.EXPO_PUBLIC_API_URL}/address/update`,
                              {
                                body: JSON.stringify({
                                  ...rest,
                                }),
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                method: "POST",
                              }
                            ),
                          ]);

                          setEditInfos(false);
                          setLoading(false);
                        }}
                        backgroundColor="#04BF7B"
                        flex={1}
                      >
                        <Text pl={5} fontSize={12} color="white">
                          Salvar
                        </Text>
                      </Button>
                    </View>
                  </View>
                </View>
              </ScrollView>
              <CustomAlert
                visible={isAlertVisible}
                title="Campos obrigatórios"
                message={`Por favor, preencha todos os campos obrigatórios:\n\n- ${missingFields.join(
                  "\n- "
                )}`}
                onConfirm={() => setIsAlertVisible(false)}
              />
            </Modal>
          </View>
        )}
      </View>
      <CustomAlert
        visible={isAlertVisible}
        title="Campos obrigatórios"
        message={`Por favor, preencha todos os campos obrigatórios:\n\n- ${missingFields.join(
          "\n- "
        )}`}
        onConfirm={() => setIsAlertVisible(false)}
      />
    </Stack>
  );
}

let items: SelectItem[] = [];
