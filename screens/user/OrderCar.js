import {
  StyleSheet,
  Image,
  Text,
  View,
  StatusBar,
  I18nManager,
  Modal,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import Car from "../../assets/image/car2.gif";
import CustomButton from "../../components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import CustomInput from "../../components/CustomInput";
import { Ionicons } from "@expo/vector-icons";
import ProgressDialog from "react-native-progress-dialog";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CountDown from "react-native-countdown-component";
import { colors } from "../../constants";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

const OrderCarScreen = ({ navigation, route }) => {
  const { user } = route.params;
  //   const [user, setUser] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [saved, setSaved] = useState(false);
  const [saved2, setSaved2] = useState(true);
  const [isloading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [refeshing, setRefreshing] = useState(false);
  const [UserInfo, setUserInfo] = useState({});

  //method to convert the authUser to json object
  const convertToJSON = (obj) => {
    try {
      setUserInfo(JSON.parse(obj));
    } catch (e) {
      setUserInfo(obj);
    }
  };

  //method to convert the authUser to json object and return token
  const getToken = (obj) => {
    try {
      setUserInfo(JSON.parse(obj));
    } catch (e) {
      setUserInfo(obj);
      return user.token;
    }
    return UserInfo.token;
  };

  const Order = async () => {
    setIsloading(true);
    var myHeaders = new Headers();
    const value = await AsyncStorage.getItem("authUser");
    let user = JSON.parse(value);
    // console.log("Checkout:", user.token);

    myHeaders.append("x-auth-token", user.token);
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      country: country,
      city: city,
      Address: streetAddress,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(network.serverip + "/carcheckout", requestOptions) //API call
      .then((response) => response.json())
      .then((result) => {
        // console.log("Checkout=>", result);
        if (result.err === "jwt expired") {
          setIsloading(false);
          alert("انتهت الجلسه");
          logout();
        }
        if (result.success == true) {
          setIsloading(false);
          setAlertType("success");
          setError(result.message);
          setSaved(false);
          setSaved2(false);

          setTimeout(() => {
            setSaved2(true);
          }, 180000);
        }
      })
      .catch((error) => {
        setIsloading(false);
        // console.log("error", error);
      });
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
    convertToJSON(user);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"dark-content"} backgroundColor={colors.light} />
      <ProgressDialog visible={isloading} label={"طلب..."} />

      <View style={styles.imageConatiner}>
        <Image source={Car} style={styles.Image} />
      </View>
      <CustomAlert message={error} type={alertType} />
      <Text style={styles.secondaryText}>
        اطلب سياره الان عن طريق اضافه بيانات موقعك الحالي
      </Text>
      <View
        style={{
          flexDirection: "row",
          width: "90%",
          justifyContent: "space-around",
        }}
      >
        <View style={{ width: "40%" }}>
          <CustomButton
            text={"ادخل العنوان"}
            onPress={() => {
              saved2 === false ? setModalVisible2(true) : setModalVisible(true);
            }}
          />
        </View>
        <View style={{ width: "40%" }}>
          <CustomButton
            disabled={saved === false ? true : false}
            text={"اطلب الان"}
            onPress={() => {
              Order();
            }}
          />
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modelBody}>
          <View style={styles.modelAddressContainer}>
            <CustomInput
              value={country}
              setValue={setCountry}
              placeholder={"أدخل البلد"}
            />
            <CustomInput
              value={city}
              setValue={setCity}
              placeholder={"أدخل المدينة"}
            />
            <CustomInput
              value={streetAddress}
              setValue={setStreetAddress}
              placeholder={"أدخل عنوان الشارع"}
            />
            {streetAddress || city || country != "" ? (
              <CustomButton
                onPress={() => {
                  setModalVisible(!modalVisible);
                  setAddress(`${streetAddress}, ${city},${country}`);
                  setSaved(true);
                }}
                text={"حفظ"}
              />
            ) : (
              <CustomButton
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
                text={"اغلاق"}
              />
            )}
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible2}
        onRequestClose={() => {
          setModalVisible(!modalVisible2);
        }}
      >
        <View style={styles.modelBody}>
          <View style={styles.modelAddressContainer}>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 22,
                }}
              >
                انتظر 3 دقائق
              </Text>
              <Text> حتي تتمكن من اعاده الطلب مره اخري </Text>
            </View>

            <View style={{ marginTop: 10, width: "90%" }}>
              <CustomButton
                onPress={() => {
                  setModalVisible2(false);
                }}
                text={"اغلاق"}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default OrderCarScreen;

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
    alignItems: "center",
    justifyContent: "center",
  },
  Image: {
    width: "70%",
    height: "70%",
  },
  secondaryText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modelBody: {
    flex: 1,
    display: "flex",
    flexL: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  modelAddressContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: 300,
    height: 300,
    backgroundColor: colors.white,
    borderRadius: 20,
    elevation: 3,
  },
});
