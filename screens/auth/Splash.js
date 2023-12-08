import { StyleSheet, Image, View, I18nManager } from "react-native";
import React, { useEffect } from "react";
import { colors } from "../../constants";
import logo from "../../assets/logo/logo_white.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNRestart from "react-native-restart";
import Constants from "expo-constants";

import * as Updates from "expo-updates";

const Splash = ({ navigation }) => {
  //method to fetch the authUser data from aync storage if there is any and login the Dashboard or Home Screen according to the user type
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem("authUser");
      if (value !== null) {
        let user = JSON.parse(value); // covert the authUser value to json
        if (user.userType === "ADMIN") {
          setTimeout(() => {
            navigation.replace("dashboard", { authUser: JSON.parse(value) }); // navigate to Admin dashboard
          }, 2000);
        } else {
          setTimeout(() => {
            navigation.replace("tab", { user: JSON.parse(value) }); // navigate to User Home screen
          }, 2000);
        }
      } else {
        setTimeout(() => {
          navigation.replace("login"); // // navigate to login screen if there is no authUser store in aysnc storage
        }, 2000);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  const shouldBeRTL = true;
  if (shouldBeRTL !== I18nManager.isRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    Updates.reloadAsync();
  }

  // check the authUser and navigate to screens accordingly on initial render
  useEffect(() => {
    _retrieveData();
    console.log(I18nManager.isRTL);
  }, []);

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={logo} />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  splashText: {
    color: colors.light,
    fontSize: 50,
    fontWeight: "bold",
  },
  logo: {
    resizeMode: "contain",
    width: 300,
    height: 300,
  },
});
