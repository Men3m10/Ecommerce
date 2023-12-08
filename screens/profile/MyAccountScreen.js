import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Alert,
  I18nManager,
} from "react-native";
import React, { useState, useEffect } from "react";
import UserProfileCard from "../../components/UserProfileCard/UserProfileCard";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import OptionList from "../../components/OptionList/OptionList";
import { network } from "../../constants";
import * as Localization from "expo-localization";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

const MyAccountScreen = ({ navigation, route }) => {
  const [showBox, setShowBox] = useState(true);
  const [error, setError] = useState("");
  const { user } = route.params;
  const userID = user["_id"];

  //method for alert
  const showConfirmDialog = (id) => {
    return Alert.alert("هل انت متأكد؟", "هل أنت متأكد أنك تريد إزالة حسابك؟", [
      {
        text: "نعم",
        onPress: () => {
          setShowBox(false);
          DeleteAccontHandle(id);
        },
      },
      {
        text: "لا",
      },
    ]);
  };

  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  //method to delete the account using API call
  const DeleteAccontHandle = (userID) => {
    let fetchURL = network.serverip + "/delete-user?id=" + String(userID);
    // console.log(fetchURL);
    fetch(fetchURL, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.success == true) {
          // console.log(result.data);
          navigation.navigate("login");
        } else {
          setError(result.message);
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
    <View style={styles.container}>
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
      <View style={styles.screenNameContainer}>
        <Text style={styles.screenNameText}>حسابي</Text>
      </View>
      <View style={styles.UserProfileCardContianer}>
        <UserProfileCard
          Icon={Ionicons}
          name={user["name"]}
          email={user["email"]}
        />
      </View>
      <View style={styles.OptionsContainer}>
        <OptionList
          text={"تغيير كلمة المرور"}
          Icon={Ionicons}
          iconName={"key-sharp"}
          onPress={
            () =>
              navigation.navigate("updatepassword", {
                userID: userID,
              }) // navigate to updatepassword
          }
        />
        <OptionList
          text={"احذف حسابي"}
          Icon={MaterialIcons}
          iconName={"delete"}
          type={"danger"}
          onPress={() => showConfirmDialog(userID)}
        />
      </View>
    </View>
  );
};

export default MyAccountScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "flex-start",
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
  UserProfileCardContianer: {
    width: "100%",
    height: "25%",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 10,
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },
  OptionsContainer: {
    width: "100%",
  },
});
