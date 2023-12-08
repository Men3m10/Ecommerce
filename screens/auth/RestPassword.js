import {
  StyleSheet,
  Image,
  Text,
  View,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  I18nManager,
} from "react-native";

import React, { useState, useEffect } from "react";
import { colors, network } from "../../constants";
import CustomInput from "../../components/CustomInput";
import header_logo from "../../assets/Mobilelogin-bro.png";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";

import { useRoute } from "@react-navigation/native";

import * as Localization from "expo-localization";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

const RestPasswordScreen = ({ navigation }) => {
  const [otp, setOtp] = useState("");
  const [isloading, setIsloading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [alertType, setAlertType] = useState("error");
  const route = useRoute();
  const { email } = route.params;

  const NewPasswordHandle = async () => {
    setIsloading(true);
    let errors = 0;
    try {
      if (!password) {
        setError("من فضلك أدخل رقمك السري");
        errors++;
        setIsloading(false);
        return;
      }
      // console.log(email);
      await fetch(`${network.serverip}/resetPassword`, {
        method: "PUT",
        body: JSON.stringify({
          email: email,
          newPassword: password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          // console.log("Response status:", response.status);
          return response.json();
        })
        .then((result) => {
          // console.log("Result:", result);
          if (result.status === "success") {
            setIsloading(false);
            setTimeout(() => {
              navigation.navigate("login");
            }, 2000);

            setAlertType("success");
            setError(result.message);
          } else {
            setIsloading(false);
            setAlertType("error");
            setError(result.message);
          }
        })
        .catch((error) => {
          setIsloading(false);
          setError(error.message);
          setAlertType("error");
          // console.log("Error:", error);
        });
    } catch (error) {
      setIsloading(false);
      setError(error.message);
      setAlertType("error");
      // console.log("error ", error);
    }
  };

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
  }, []);
  return (
    <KeyboardAvoidingView
      // behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, width: "100%" }}
      >
        <ProgressDialog visible={isloading} label={"تسجيل ..."} />
        <StatusBar barStyle={"dark-content"} backgroundColor={colors.light} />
        <Image source={header_logo} style={styles.logo} />

        <View style={styles.screenNameContainer}>
          <Text style={styles.screenNameText}>أدخل كلمة المرور الجديدة</Text>
        </View>
        <View style={styles.formContainer}>
          <CustomAlert message={error} type={alertType} />
          <View style={styles.EmailView}>
            <Text>{email}</Text>
          </View>
          <CustomInput
            value={password}
            setValue={setPassword}
            placeholder={"كلمة المرور الجديدة"}
            placeholderTextColor={colors.muted}
            radius={5}
          />
        </View>

        <View style={styles.buttomContainer}>
          <CustomButton
            text={"اضبط كلمة مرور جديدة"}
            onPress={() => {
              NewPasswordHandle();
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RestPasswordScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    flex: 1,
  },
  EmailView: {
    height: 40,
    marginBottom: 10,
    marginTop: 10,
    width: "100%",
    padding: 5,
    backgroundColor: colors.white,
    elevation: 5,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },

  formContainer: {
    flex: 3,
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    width: "100%",
    flexDirecion: "row",
    padding: 5,
    marginTop: 20,
  },
  logo: {
    width: "50%",
    height: 200,
    alignSelf: "center",
    marginTop: "30%",
  },

  buttomContainer: {
    justifyContent: "center",
    width: "100%",
    marginTop: 30,
  },

  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  screenNameText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.muted,
  },
});
