import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  StatusBar,
  Text,
  ScrollView,
  I18nManager,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import cartIcon from "../../assets/icons/cart_beg_active.png";
import { colors, network } from "../../constants";
import CartProductList from "../../components/CartProductList/CartProductList";
import CustomButton from "../../components/CustomButton";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import { bindActionCreators } from "redux";
import * as Localization from "expo-localization";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

const CartScreen = ({ navigation, route }) => {
  const cartproduct = useSelector((state) => state.product);
  const [totalPrice, setTotalPrice] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const dispatch = useDispatch();

  const { user } = route.params;
  const { removeCartItem, increaseCartItemQuantity, decreaseCartItemQuantity } =
    bindActionCreators(actionCreaters, dispatch);

  //method to remove the item from (cart) redux
  const deleteItem = (id) => {
    removeCartItem(id);
  };

  //method to increase the quantity of the item in(cart) redux
  const increaseQuantity = (id, quantity, avaiableQuantity) => {
    if (avaiableQuantity > quantity) {
      increaseCartItemQuantity({ id: id, type: "increase" });
      setRefresh(!refresh);
    }
  };

  //method to decrease the quantity of the item in(cart) redux
  const decreaseQuantity = (id, quantity) => {
    if (quantity > 1) {
      decreaseCartItemQuantity({ id: id, type: "decrease" });
      setRefresh(!refresh);
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

  //calcute and the set the total price whenever the value of carproduct change
  useEffect(() => {
    setTotalPrice(
      cartproduct.reduce((accumulator, object) => {
        return accumulator + object.price * object.quantity;
      }, 0)
    );
    // console.log(user);
  }, [cartproduct, refresh]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"dark-content"} backgroundColor={colors.light} />
      <View style={styles.topBarContainer}>
        <View style={styles.cartInfoContainerTopBar}>
          <View style={styles.cartInfoTopBar}>
            <Text>سله المشتريات</Text>
            <Text>{cartproduct.length} منتج</Text>
          </View>
        </View>
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
      {cartproduct.length === 0 ? (
        <View style={styles.cartProductListContiainerEmpty}>
          <Text style={styles.secondaryTextSmItalic}>
            "سله المشتريات فارغه"
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.cartProductListContiainer}>
          {cartproduct.map((item, index) => (
            <CartProductList
              key={index}
              index={index}
              image={item.image}
              title={item.title}
              price={item.price}
              quantity={item.quantity}
              onPressIncrement={() => {
                increaseQuantity(
                  item._id,
                  item.quantity,
                  item.avaiableQuantity
                );
              }}
              onPressDecrement={() => {
                decreaseQuantity(item._id, item.quantity);
              }}
              handleDelete={() => {
                deleteItem(item._id);
              }}
            />
          ))}
          <View style={styles.emptyView}></View>
        </ScrollView>
      )}
      <View style={styles.cartBottomContainer}>
        <View style={styles.cartBottomLeftContainer}>
          <View style={styles.IconContainer}>
            <MaterialIcons
              name="featured-play-list"
              size={24}
              color={colors.primary}
            />
          </View>
          <View>
            <Text style={styles.cartBottomPrimaryText}>Total</Text>
            <Text style={styles.cartBottomSecondaryText}>
              {totalPrice.toString().length >= 15
                ? totalPrice.toString().substring(0, 5) + "..."
                : totalPrice}
              EGP
            </Text>
          </View>
        </View>
        <View style={styles.cartBottomRightContainer}>
          {cartproduct.length > 0 ? (
            <CustomButton
              text={"الدفع"}
              onPress={() => navigation.navigate("checkout", { user })}
            />
          ) : (
            <CustomButton
              text={"الدفع"}
              disabled={true}
              onPress={() => navigation.navigate("checkout")}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default CartScreen;

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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  toBarText: {
    fontSize: 15,
    fontWeight: "600",
  },
  cartProductListContiainer: { width: "100%", padding: 20 },
  cartProductListContiainerEmpty: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  secondaryTextSmItalic: {
    fontStyle: "italic",
    fontSize: 15,
    color: colors.muted,
  },
  cartBottomContainer: {
    width: "100%",
    height: 120,
    display: "flex",
    backgroundColor: colors.white,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    elevation: 3,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  cartBottomLeftContainer: {
    padding: 20,
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "column",
    alignItems: "center",
    width: "30%",
    height: "100%",
  },
  cartBottomRightContainer: {
    padding: 30,
    display: "flex",
    justifyContent: "flex-end",
    flexDirection: "column",
    alignItems: "center",
    width: "70%",
    height: "100%",
  },
  cartBottomPrimaryText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  cartBottomSecondaryText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyView: {
    width: "100%",
    height: 20,
  },
  IconContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light,
    height: 40,
    width: 40,
    borderRadius: 5,
  },
  cartInfoContainerTopBar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cartInfoTopBar: {
    justifyContent: "center",
    alignItems: "flex-start",
    marginLeft: 5,
  },
});
