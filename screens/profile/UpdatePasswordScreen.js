import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  I18nManager,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors, network } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressDialog from "react-native-progress-dialog";

import * as Localization from "expo-localization";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

const UpdatePasswordScreen = ({ navigation, route }) => {
  const { userID } = route.params;
  const [error, setError] = useState("");
  const [currnetPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setCconfirmPassword] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [isloading, setIsloading] = useState(false);

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    password: currnetPassword,
    newPassword: newPassword,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const logout = async () => {
    await AsyncStorage.removeItem("authUser");
    navigation.replace("login");
  };

  // method to update the password by the check the current password
  const updatePasswordHandle = () => {
    if (currnetPassword == "" || newPassword == "" || confirmPassword == "") {
      setError("الرجاء إدخال جميع الحقول");
      return;
    }
    if (currnetPassword == newPassword) {
      setError("لا يُسمح لك بتعيين كلمة المرور السابقة المستخدمة");
    } else if (newPassword != confirmPassword) {
      setError("كلمة المرور غير متطابقة");
    } else {
      setIsloading(true);
      fetch(
        network.serverip + "/change-password?id=" + String(userID),
        requestOptions
      ) // API call
        .then((response) => response.json())
        .then((result) => {
          // console.log(result);
          if (result.success) {
            setAlertType("success");
            setError("يتم تحديث كلمة المرور بنجاح ");
            setTimeout(() => {
              logout();
            }, 2000);
          } else {
            setError(result.message);
            setAlertType("error");
          }
          setIsloading(false);
        })
        .catch((error) => {
          setAlertType("error");
          setError(error.message);
          // console.log("error", error.message);
        });
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
    <View style={styles.container}>
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
          <Text style={styles.screenNameText}>تعديل كلمة السر</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph}>
            يجب أن تكون كلمة المرور الجديدة مختلفة عن كلمة المرور السابقة
            المستعملة
          </Text>
        </View>
      </View>
      <View style={styles.formContainer}>
        <ProgressDialog visible={isloading} label={"تحديث ..."} />

        <CustomAlert message={error} type={alertType} />
        <CustomInput
          value={currnetPassword}
          setValue={setCurrentPassword}
          placeholder={"كلمة السر الحالية"}
          secureTextEntry={true}
        />
        <CustomInput
          value={newPassword}
          setValue={setNewPassword}
          placeholder={"كلمة المرور الجديدة"}
          secureTextEntry={true}
        />
        <CustomInput
          value={confirmPassword}
          setValue={setCconfirmPassword}
          placeholder={"تأكيد كلمة المرور الجديدة"}
          secureTextEntry={true}
        />
      </View>
      <CustomButton
        text={"تعديل كلمة السر"}
        onPress={updatePasswordHandle}
        radius={5}
      />
    </View>
  );
};

export default UpdatePasswordScreen;

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
