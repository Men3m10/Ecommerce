import {
  StyleSheet,
  StatusBar,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Modal,
  I18nManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import BasicProductList from "../../components/BasicProductList/BasicProductList";
import { colors, network } from "../../constants";
import CustomButton from "../../components/CustomButton";
import { useSelector, useDispatch } from "react-redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import { bindActionCreators } from "redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomInput from "../../components/CustomInput";
import ProgressDialog from "react-native-progress-dialog";
import * as Localization from "expo-localization";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

const CheckoutScreen = ({ navigation, route }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const { emptyCart } = bindActionCreators(actionCreaters, dispatch);
  const { user } = route.params;

  const [deliveryCost, setDeliveryCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [zipcode, setZipcode] = useState("");

  //method to remove the authUser from aysnc storage and navigate to login
  const logout = async () => {
    await AsyncStorage.removeItem("authUser");
    navigation.replace("login");
  };

  //method to handle checkout
  const handleCheckout = async () => {
    setIsloading(true);
    var myHeaders = new Headers();
    const value = await AsyncStorage.getItem("authUser");
    let user = JSON.parse(value);
    // console.log("Checkout:", user.token);

    myHeaders.append("x-auth-token", user.token);
    myHeaders.append("Content-Type", "application/json");

    var payload = [];
    var totalamount = 0;

    // fetch the cart items from redux and set the total cost
    cartproduct.forEach((product) => {
      let obj = {
        productId: product._id,
        price: product.price,
        quantity: product.quantity,
      };
      totalamount += parseInt(product.price) * parseInt(product.quantity);
      payload.push(obj);
    });

    var raw = JSON.stringify({
      items: payload,
      amount: totalamount,
      discount: 0,
      payment_type: "cod",
      country: country,
      status: "pending",
      city: city,
      zipcode: zipcode,
      shippingAddress: streetAddress,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(network.serverip + "/checkout", requestOptions) //API call
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
          emptyCart("empty");
          navigation.replace("orderconfirm");
        }
      })
      .catch((error) => {
        setIsloading(false);
        // console.log("error", error);
      });
  };

  // set the address and total cost on initital render
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
    if (streetAddress && city && country != "") {
      setAddress(`${streetAddress}, ${city},${country}`);
    } else {
      setAddress("");
    }
    setTotalCost(
      cartproduct.reduce((accumulator, object) => {
        return accumulator + object.price * object.quantity;
      }, 0)
    );
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"dark-content"} backgroundColor={colors.light} />
      <ProgressDialog visible={isloading} label={"طلب..."} />
      <View style={styles.topBarContainer}>
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
        <View></View>
        <View></View>
      </View>
      <ScrollView style={styles.bodyContainer} nestedScrollEnabled={true}>
        <Text style={styles.primaryText}>ملخص الطلب</Text>
        <ScrollView
          style={styles.orderSummaryContainer}
          nestedScrollEnabled={true}
        >
          {cartproduct.map((product, index) => (
            <BasicProductList
              key={index}
              title={product.title}
              price={product.price}
              quantity={product.quantity}
            />
          ))}
        </ScrollView>
        <Text style={styles.primaryText}>المجموع</Text>
        <View style={styles.totalOrderInfoContainer}>
          <View style={styles.list}>
            <Text>الطلب</Text>
            <Text>{totalCost} EGP</Text>
          </View>
          <View style={styles.list}>
            <Text>التوصيل</Text>
            <Text>{deliveryCost} EGP</Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.primaryTextSm}>المجموع الكلي</Text>
            <Text style={styles.secondaryTextSm}>
              {totalCost + deliveryCost} EGP
            </Text>
          </View>
        </View>
        <Text style={styles.primaryText}>معلومات الطالب</Text>
        <View style={styles.listContainer}>
          <View style={styles.list}>
            <Text style={styles.secondaryTextSm}>البريد</Text>
            <Text style={styles.secondaryTextSm}>{user.email}</Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.secondaryTextSm}>رقم الهاتف</Text>
            <Text style={styles.secondaryTextSm}>
              {user.phone ? user.phone : "لا يوجد رقم هاتف"}
            </Text>
          </View>
        </View>
        <Text style={styles.primaryText}>العنوان</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity
            style={styles.list}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.secondaryTextSm}>العنوان</Text>
            <View>
              {country || city || streetAddress != "" ? (
                <Text
                  style={styles.secondaryTextSm}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {address.length < 25
                    ? `${address}`
                    : `${address.substring(0, 25)}...`}
                </Text>
              ) : (
                <Text style={styles.primaryTextSm}>اضافه</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.primaryText}>الدفع</Text>
        <View style={styles.listContainer}>
          <View style={styles.list}>
            <Text style={styles.secondaryTextSm}>النوع</Text>
            <Text style={styles.primaryTextSm}>الدفع عند الاستلام</Text>
          </View>
        </View>

        <View style={styles.emptyView}></View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        {country && city && streetAddress != "" ? (
          <CustomButton
            text={"أكد الطلب"}
            // onPress={() => navigation.replace("orderconfirm")}
            onPress={() => {
              handleCheckout();
            }}
          />
        ) : (
          <CustomButton text={"أكد الطلب"} disabled />
        )}
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
            <CustomInput
              value={zipcode}
              setValue={setZipcode}
              placeholder={"أدخل الرمز البريدي"}
              keyboardType={"number-pad"}
            />
            {streetAddress || city || country != "" ? (
              <CustomButton
                onPress={() => {
                  setModalVisible(!modalVisible);
                  setAddress(`${streetAddress}, ${city},${country}`);
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
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: 0,
    flex: 1,
  },
  topBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 20,
  },
  toBarText: {
    fontSize: 15,
    fontWeight: "600",
  },
  bodyContainer: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
  },
  orderSummaryContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    maxHeight: 220,
  },
  totalOrderInfoContainer: {
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.white,
  },
  primaryText: {
    marginBottom: 5,
    marginTop: 5,
    fontSize: 20,
    fontWeight: "bold",
  },
  list: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: colors.white,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    padding: 10,
  },
  primaryTextSm: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.primary,
  },
  secondaryTextSm: {
    fontSize: 15,
    fontWeight: "bold",
  },
  listContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
  },
  buttomContainer: {
    width: "100%",
    padding: 20,
    paddingLeft: 30,
    paddingRight: 30,
  },
  emptyView: {
    width: "100%",
    height: 20,
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
    width: 320,
    height: 400,
    backgroundColor: colors.white,
    borderRadius: 20,
    elevation: 3,
  },
});
