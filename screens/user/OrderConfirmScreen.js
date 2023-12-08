import {
  StyleSheet,
  Image,
  Text,
  View,
  StatusBar,
  I18nManager,
} from "react-native";
import React, { useEffect, useState } from "react";
import SuccessImage from "../../assets/image/success2.png";
import CustomButton from "../../components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

const OrderConfirmScreen = ({ navigation }) => {
  const [user, setUser] = useState({});

  //method to get authUser from async storage
  const getUserData = async () => {
    const value = await AsyncStorage.getItem("authUser");
    setUser(JSON.parse(value));
  };

  //fetch user data on initial render
  useEffect(() => {
    async function setRTLLayout() {
      const locale = await Localization.localeAsync();
      if (locale.includes("ar") || locale.includes("he")) {
        I18nManager.forceRTL(true);
      } else {
        I18nManager.forceRTL(false);
      }
    }

    setRTLLayout();
    getUserData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"dark-content"} backgroundColor={colors.light} />
      <View style={styles.imageConatiner}>
        <Image source={SuccessImage} style={styles.Image} />
      </View>
      <Text style={styles.secondaryText}>تم تأكيد الطلب</Text>
      <View>
        <CustomButton
          text={"العودة إلى الصفحه الرئيسيه"}
          onPress={() => navigation.replace("tab", { user: user })}
        />
      </View>
    </View>
  );
};

export default OrderConfirmScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 40,
    flex: 1,
  },
  imageConatiner: {
    width: "100%",
  },
  Image: {
    width: "100%",
    height: "80%",
  },
  secondaryText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
