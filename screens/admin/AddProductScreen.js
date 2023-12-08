import {
  StyleSheet,
  Text,
  Image,
  StatusBar,
  View,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Modal,
  I18nManager,
} from "react-native";
import React, { useState } from "react";
import { colors, network } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import * as ImagePicker from "expo-image-picker";
import ProgressDialog from "react-native-progress-dialog";
import { AntDesign } from "@expo/vector-icons";
import { useEffect } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { SelectList } from "react-native-dropdown-select-list";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

const AddProductScreen = ({ navigation, route }) => {
  const { authUser } = route.params;
  const [isloading, setIsloading] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");
  const [image, setImage] = useState("");
  const [image2, setImage2] = useState("");
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [user, setUser] = useState({});
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [statusDisable, setStatusDisable] = useState(false);
  const [items, setItems] = useState([]);
  var payload = [];

  //method to convert the authUser to json object.
  const getToken = (obj) => {
    try {
      setUser(JSON.parse(obj));
    } catch (e) {
      setUser(obj);
      return obj.token;
    }
    return JSON.parse(obj).token;
  };

  //Method : Fetch category data from using API call and store for later you in code
  const fetchCategories = () => {
    var myHeaders = new Headers();
    myHeaders.append("x-auth-token", getToken(authUser));

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    setIsloading(true);
    fetch(`${network.serverip}/categories`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setCategories(result.categories);

          result.categories.forEach((cat) => {
            let obj = {
              key: cat._id,
              value: cat.title,
            };

            payload.push(obj);
          });

          setItems(payload);
          setError("");
        } else {
          setError(result.message);
        }
        setIsloading(false);
      })
      .catch((error) => {
        setIsloading(false);
        setError(error.message);
        // console.log("error", error);
      });
  };

  var myHeaders = new Headers();
  myHeaders.append("x-auth-token", authUser.token);
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    title: title,
    sku: sku,
    price: price,
    image: image2,
    description: description,
    category: category,
    quantity: quantity,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  //Method for selecting the image from device gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
    });

    // console.log(result);

    if (!result.canceled) {
      setImage(result.uri);
    }
  };

  const upload = async (image) => {
    setIsloading(true);
    let errors = 0;
    try {
      if (!image) {
        setIsloading(false);
        setError("الرجاء تحديد صورة أولاً");
        // console.log("Please select an image first");
        return;
      }
      if (title == "") {
        setError("الرجاء إدخال عنوان المنتج");
        errors++;
        setIsloading(false);
        return;
      } else if (price == 0) {
        setError("الرجاء إدخال سعر المنتج");
        setIsloading(false);
        errors++;
        return;
      } else if (quantity <= 0) {
        setError("يجب أن تكون الكمية أكبر من 1");
        setIsloading(false);
        errors++;
        return;
      } else if (!description) {
        setError("الرجاء إدخال وصف المنتج");
        setIsloading(false);
        errors++;
        return;
      } else if (!category) {
        setError("الرجاء تحديد الفئة");
        setIsloading(false);
        errors++;
        return;
      } else if (image == null) {
        setError("يرجى تحميل صورة المنتج");
        setIsloading(false);
        errors++;
        return;
      }
      const formData = new FormData();
      formData.append("image", {
        uri: image,
        type: "image/jpeg",
        name: "image.jpg",
      });

      await fetch("https://super-market-v4nq.onrender.com/photos/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
        .then((response) => response.json())
        .then((result) => {
          // console.log(result);
          setIsloading(false);
          setAlertType("success");
          let img;
          img = result.image;
          let imageId;
          imageId = result.id;

          //[check validation] -- Start

          if (errors === 0) {
            //[check validation] -- End
            fetch(network.serverip + "/product", {
              method: "POST",
              headers: myHeaders,
              body: JSON.stringify({
                title: title,
                sku: sku,
                price: price,
                image: img,
                description: description,
                category: category,
                quantity: quantity,
                imageId: imageId,
              }),
              redirect: "follow",
            })
              .then((response) => response.json())
              .then((result) => {
                // console.log(result);
                if (result.success == true) {
                  setIsloading(false);
                  setAlertType("success");

                  setError(result.message);
                  setTitle("");
                  setDescription("");
                  setPrice("");
                  setSku("");
                  setQuantity("");
                }
              })
              .catch((error) => {
                setIsloading(false);
                setError(error.message);
                setAlertType("error");
                // console.log("error", error);
              });
          }
        });
    } catch (error) {
      setIsloading(false);
      setError(error.message);
      setAlertType("error");
      // console.log("error", error);
    }
  };

  //call the fetch functions initial render
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container}>
      <StatusBar barStyle={"dark-content"} backgroundColor={colors.light} />
      <ProgressDialog visible={isloading} label={"اضافه ..."} />
      <View style={styles.TopBarContainer}>
        <TouchableOpacity
          onPress={() => {
            // navigation.replace("viewproduct", { authUser: authUser });
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
          <Text style={styles.screenNameText}>أضف منتج</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph}>أضف تفاصيل المنتج</Text>
        </View>
      </View>
      <CustomAlert message={error} type={alertType} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, width: "100%" }}
      >
        <View style={styles.formContainer}>
          <View style={styles.imageContainer}>
            {image ? (
              <TouchableOpacity style={styles.imageHolder} onPress={pickImage}>
                <Image
                  source={{ uri: image }}
                  style={{ width: 200, height: 200 }}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.imageHolder} onPress={pickImage}>
                <AntDesign name="pluscircle" size={50} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>
          <CustomInput
            value={sku}
            setValue={setSku}
            placeholder={"SKU"}
            placeholderTextColor={colors.muted}
            radius={5}
          />
          <CustomInput
            value={title}
            setValue={setTitle}
            placeholder={"العنوان"}
            placeholderTextColor={colors.muted}
            radius={5}
          />
          <CustomInput
            value={price}
            setValue={setPrice}
            placeholder={"السعر"}
            keyboardType={"number-pad"}
            placeholderTextColor={colors.muted}
            radius={5}
          />
          <CustomInput
            value={quantity}
            setValue={setQuantity}
            placeholder={"الكميه"}
            keyboardType={"number-pad"}
            placeholderTextColor={colors.muted}
            radius={5}
          />
          <CustomInput
            value={description}
            setValue={setDescription}
            placeholder={"الوصف"}
            placeholderTextColor={colors.muted}
            radius={5}
          />
        </View>
      </ScrollView>
      <View style={{ width: "90%" }}>
        <SelectList
          setSelected={setCategory}
          data={items}
          placeholder="حدد فئة المنتج"
        />
      </View>
      {/* <View style={{ height: 200 }}>
        <DropDownPicker
          placeholder={"Select Product Category"}
          open={open}
          value={category}
          items={items}
          setOpen={setOpen}
          setValue={setCategory}
          setItems={setItems}
          disabled={statusDisable}
          disabledStyle={{
            backgroundColor: colors.light,
            borderColor: colors.white,
          }}
          labelStyle={{ color: colors.muted }}
          style={{ borderColor: "#fff", elevation: 5 }}
        
        />
      </View> */}
      <View style={styles.buttomContainer}>
        <CustomButton
          text={"أضف منتج"}
          onPress={() => {
            upload(image);
          }}
          // disabled={checksDisable}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddProductScreen;

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
  formContainer: {
    flex: 2,
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    width: "100%",
    flexDirecion: "row",
    padding: 5,
  },

  buttomContainer: {
    marginTop: 10,
    width: "100%",
  },
  bottomContainer: {
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
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
  imageContainer: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
    height: 250,
    backgroundColor: colors.white,
    borderRadius: 10,
    elevation: 5,
    paddingLeft: 20,
    paddingRight: 20,
  },
  imageHolder: {
    height: 200,
    width: 200,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light,
    borderRadius: 10,
    elevation: 5,
  },
});
