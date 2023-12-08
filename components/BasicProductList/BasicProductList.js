import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import { Ionicons } from "@expo/vector-icons";

const BasicProductList = ({ title, price, quantity }) => {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.IconContainer}>
          <Ionicons name="checkmark-done" size={30} color={colors.muted} />
        </View>
        <View style={styles.productInfoContainer}>
          <Text style={styles.secondaryText}>
            {title.length > 20 ? title.substring(0, 7) + "..." : title}
          </Text>
          <Text>x{quantity}</Text>
        </View>
      </View>
      <View style={{ marginTop: 10 }}>
        <Text style={styles.primaryText}>
          {" "}
          {(price * quantity).toString().length >= 15
            ? (price * quantity).toString().substring(0, 13) + " ... "
            : price * quantity}{" "}
          EGP
        </Text>
      </View>
    </View>
  );
};

export default BasicProductList;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: colors.white,
    height: 70,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    padding: 5,
  },
  innerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  productInfoContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    marginLeft: 10,
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
  primaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
