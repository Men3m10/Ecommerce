import {
  View,
  Text,
  Image,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
} from "react-native";
import React, { useState, useEffect } from "react";

import { colors, network } from "../../constants";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";

import logo from "../../assets/6325252.png";
import { useRoute } from "@react-navigation/native";
import OTPInput from "react-native-otp-withpaste";
import * as Localization from "expo-localization";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

const VerifyOtpScreen = ({ navigation }) => {
  const [otp, setOtp] = useState("");
  const [isloading, setIsloading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");
  const route = useRoute();
  const { email } = route.params;

  const VerifyOtpHandle = async () => {
    setIsloading(true);
    let errors = 0;
    try {
      if (otp == "") {
        setError("الرجاء إدخال OTP الخاص بك");
        errors++;
        setIsloading(false);
        return;
      }
      // console.log(email);
      await fetch(`${network.serverip}/verify`, {
        method: "POST",
        body: JSON.stringify({
          resetCode: otp,
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
            navigation.navigate("restpassword", { email: email });
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
    <>
      <StatusBar barStyle={"dark-content"} backgroundColor={colors.light} />
      <ProgressDialog visible={isloading} label={"التحقق ..."} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* -------------- */}
        <Image source={logo} style={styles.logostyle} />
        <Text style={[styles.signtext, { marginTop: "10%" }]}>
          الرجاء إدخال
        </Text>
        <Text style={styles.signtext}>رمز التحقق</Text>
        <CustomAlert message={error} type={alertType} />

        {/* ------------ */}

        <View
          style={{
            width: "90%",
            marginHorizontal: "5%",
            height: 50,
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center",
            marginVertical: "15%",
          }}
        >
          <OTPInput
            title="أدخل OTP"
            type="outline"
            onChange={(code) => {
              code.length < 4 ? setDisabled(true) : setDisabled(false);
              setOtp(code);
            }}
            onPasted={otp}
            inputStyle={{
              width: 45,
              height: 45,
              borderWidth: 1,
              borderBottomWidth: 1,
              color: colors.primary_shadow,
            }}
            borderColor={colors.primary_shadow}
          />
        </View>

        {/* ------------ */}
        <TouchableOpacity
          style={
            disabled === true ? styles.signbuttondisabled : styles.signbutton
          }
          disabled={disabled}
          onPress={() => {
            VerifyOtpHandle();
          }}
        >
          <Text style={styles.textbutton}>تأكيد</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

export default VerifyOtpScreen;

const styles = StyleSheet.create({
  logostyle: {
    width: "50%",
    height: 200,
    alignSelf: "center",
    marginTop: "30%",
  },
  signtext: {
    fontWeight: "700",
    fontSize: 25,
    color: "#000",
    alignSelf: "center",
  },
  signbutton: {
    width: "50%",
    height: 55,
    backgroundColor: colors.primary_shadow,
    alignSelf: "center",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  signbuttondisabled: {
    width: "50%",
    height: 55,
    backgroundColor: colors.dark,
    alignSelf: "center",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  textbutton: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 20,
  },
});
