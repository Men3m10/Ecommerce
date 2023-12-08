import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  I18nManager,
} from "react-native";
import React, { useState, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors, network } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

const ForgetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [isloading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");

  const sendOTPHandle = async () => {
    setIsloading(true);
    let errors = 0;
    try {
      if (email == "") {
        setError("من فضلك ادخل البريد");
        errors++;
        setIsloading(false);
        return;
      }

      //navigation.navigate("verify", { email: email });
      await fetch(`${network.serverip}/forgetPassword`, {
        method: "POST",
        body: JSON.stringify({
          email: email,
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
              navigation.navigate("verify", { email: email });
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

  return (
    <View style={styles.container}>
      <ProgressDialog visible={isloading} label={"ارسال ..."} />
      <View style={styles.TopBarContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <View>
          <Text style={styles.screenNameText}>إعادة تعيين كلمة المرور</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph}>
            أدخل البريد الإلكتروني المرتبط بحسابك وسنرسل بريدًا إلكترونيًا مع
            تعليمات لإعادة تعيين كلمة المرور.
          </Text>
        </View>
      </View>
      <CustomAlert message={error} type={alertType} />
      <View style={styles.formContainer}>
        <CustomInput
          value={email}
          setValue={setEmail}
          placeholder={"أدخل عنوان بريدك الالكتروني"}
          placeholderTextColor={colors.muted}
          radius={5}
        />
      </View>
      <CustomButton
        text={"إرسال OTP"}
        onPress={() => {
          sendOTPHandle();
        }}
        radius={5}
      />
    </View>
  );
};

export default ForgetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    padding: 20,
    flex: 1,
  },
  TopBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },
  screenNameParagraph: {
    marginTop: 5,
    fontSize: 15,
  },
  formContainer: {
    marginTop: 10,
    marginBottom: 20,
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    width: "100%",
    flexDirecion: "row",
  },
});
