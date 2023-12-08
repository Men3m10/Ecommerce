import {
  StyleSheet,
  Text,
  Image,
  StatusBar,
  View,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  I18nManager,
} from "react-native";
import React, { useState, useEffect } from "react";
import { colors, network } from "../../constants";
import CustomInput from "../../components/CustomInput";
import header_logo from "../../assets/logo/logo.png";
import CustomButton from "../../components/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import InternetConnectionAlert from "react-native-internet-connection-alert";
import ProgressDialog from "react-native-progress-dialog";
import * as Localization from "expo-localization";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isloading, setIsloading] = useState(false);
  const [alertType, setAlertType] = useState("error");

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    email: email,
    password: password,
    name: name,
    phone,
    userType: "USER",
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const validate = (text) => {
    let reg = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
    if (reg.test(text) === false) {
      setEmail(text);
      return false;
    } else {
      setEmail(text);
      return true;
    }
  };

  //method to post the user data to server for user signup using API call
  const signUpHandle = () => {
    let errors = 0;
    if (email == "" || !validate(email)) {
      errors++;
      return setError("من فضلك ادخل بريد صحيح");
    }
    if (name == "") {
      errors++;
      return setError("من فضلك ادخل اسمك");
    }
    if (password == "") {
      errors++;
      return setError("من فضلك ادخل كلمه المرور");
    }
    if (!email.includes("@")) {
      errors++;
      return setError("البريد غير صحيح");
    }
    if (email.length < 6) {
      errors++;
      return setError("البريد قصير جدا");
    }
    if (password.length < 5) {
      errors++;
      return setError("كلمه المرور تتكون من 6 ارقام");
    }
    if (password != confirmPassword) {
      errors++;
      return setError("غير متطابقان");
    }
    if (
      !(
        phone.startsWith("010") ||
        phone.startsWith("011") ||
        phone.startsWith("012") ||
        phone.startsWith("015")
      )
    ) {
      return setError("ادخل رقم هاتف صحيح");
    }
    if (phone.length != 11) {
      return setError("رقم الهاتف يتكون من 11 رقم");
    }
    setIsloading(true);
    fetch(network.serverip + "/register", requestOptions) // API call
      .then((response) => response.json())
      .then((result) => {
        // console.log(result);
        if (result.success == true) {
          setIsloading(false);
          setAlertType("success");
          setError(result.message);
          if (result.data["email"] == email) {
            navigation.navigate("login");
          }
        } else {
          setIsloading(false);
          setError(result.message);
          setAlertType("error");
        }
      })
      .catch((error) => setError(error.message));
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
    <InternetConnectionAlert
      onChange={(connectionState) => {
        // console.log("Connection State: ", connectionState);
      }}
    >
      <KeyboardAvoidingView style={styles.container}>
        <ProgressDialog visible={isloading} label={"انشاء حساب ..."} />
        <StatusBar barStyle={"dark-content"} backgroundColor={colors.light} />
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
        <ScrollView
          style={{ flex: 1, width: "100%" }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welconeContainer}>
            <Image style={styles.logo} source={header_logo} />
          </View>
          <View style={styles.screenNameContainer}>
            <View>
              <Text style={styles.screenNameText}>اشتراك</Text>
            </View>
            <View>
              <Text style={styles.screenNameParagraph}>
                قم بإنشاء حسابك على Hells Kitchen للوصول إلى ملايين المنتجات
              </Text>
            </View>
          </View>
          <View style={styles.formContainer}>
            <CustomAlert message={error} type={alertType} />
            <CustomInput
              value={name}
              setValue={setName}
              placeholder={"الاسم"}
              placeholderTextColor={colors.muted}
              radius={5}
            />
            <CustomInput
              value={email}
              setValue={setEmail}
              placeholder={"البريد الالكتروني"}
              placeholderTextColor={colors.muted}
              radius={5}
              keyboardType={"email-address"}
            />
            <CustomInput
              value={phone}
              setValue={setPhone}
              placeholder={"رقم الهاتف"}
              placeholderTextColor={colors.muted}
              radius={5}
              keyboardType={"numeric"}
            />
            <CustomInput
              value={password}
              setValue={setPassword}
              secureTextEntry={true}
              placeholder={"كلمه المرور"}
              placeholderTextColor={colors.muted}
              radius={5}
            />
            <CustomInput
              value={confirmPassword}
              setValue={setConfirmPassword}
              secureTextEntry={true}
              placeholder={"تأكيد كلمه المرور"}
              placeholderTextColor={colors.muted}
              radius={5}
            />
          </View>
        </ScrollView>
        <View style={styles.buttomContainer}>
          <CustomButton text={"تسجيل"} onPress={signUpHandle} />
        </View>
        <View style={styles.bottomContainer}>
          <Text>لديك حساب بالفعل؟</Text>
          <Text
            onPress={() => navigation.navigate("login")}
            style={styles.signupText}
          >
            تسجيل الدخول
          </Text>
        </View>
      </KeyboardAvoidingView>
    </InternetConnectionAlert>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
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
  welconeContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "15%",
  },
  formContainer: {
    flex: 2,
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    width: "100%",
    flexDirecion: "row",
    padding: 5,
  },
  logo: {
    resizeMode: "contain",
    width: 180,
  },
  forgetPasswordContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  ForgetText: {
    fontSize: 15,
    fontWeight: "600",
  },
  buttomContainer: {
    width: "100%",
  },
  bottomContainer: {
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    marginLeft: 2,
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
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
});
