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
import React, { useEffect, useState } from "react";
import { colors, network } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import * as ImagePicker from "expo-image-picker";
import ProgressDialog from "react-native-progress-dialog";
import { AntDesign } from "@expo/vector-icons";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

const EditProductScreen = ({ navigation, route }) => {
  const { product, authUser } = route.params;
  const [isloading, setIsloading] = useState(false);
  const [label, setLabel] = useState("تعديل...");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");
  const [image, setImage] = useState("");
  const [imageId, setImageId] = useState("");
  const [imageChanged, setImageChanged] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [alertType, setAlertType] = useState("error");

  var myHeaders = new Headers();
  myHeaders.append("x-auth-token", authUser.token);
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    title: title,
    sku: sku,
    price: price,
    image: image,
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
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
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
      if (image == null) {
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
          let imageIdd;
          imageIdd = result.id;

          //[check validation] -- Star
          if (errors === 0) {
            editProductHandle(img, imageIdd);
            handleDeleteImg(imageId);
          }
        });
    } catch (error) {
      setIsloading(false);
      setError(error.message);
      setAlertType("error");
      // console.log("error", error);
    }
  };

  handleDeleteImg = (id) => {
    setIsloading(true);
    fetch(`${network.serverip}/Delete-Img`, {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
      body: JSON.stringify({
        id,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        // console.log(result);
        if (result.success) {
          setError(result.message);
          setAlertType("success");
        } else {
          setError(result.message);
          setAlertType("error");
        }
        setIsloading(false);
      })
      .catch((error) => {
        setIsloading(false);
        setError(error.message);
        // console.log("error", error);
      });
  };

  //Method for imput validation and post data to server to edit product using API call
  const editProductHandle = (img, imgID) => {
    setIsloading(true);
    if (title == "") {
      setError("الرجاء إدخال عنوان المنتج");
      setIsloading(false);
    } else if (price == 0) {
      setError("الرجاء إدخال سعر المنتج");
      setIsloading(false);
    } else if (quantity <= 0) {
      setError("يجب أن تكون الكمية أكبر من 1");
      setIsloading(false);
    } else if (image == null) {
      setError("يرجى تحميل صورة المنتج");
      setIsloading(false);
    } else {
      // console.log(`${network.serverip}"/update-product?id=${product._id}"`);
      fetch(`${network.serverip}/update-product?id=${product._id}`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          title: title,
          sku: sku,
          price: price,
          description: description,
          category: category,
          quantity: quantity,
          image: img,
          imageId: imgID,
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
            setPrice("");
            setQuantity("");
            setSku("");
            setTitle("");
            setDescription("");
            setTimeout(() => {
              navigation.goBack();
            }, 2000);
          }
        })
        .catch((error) => {
          setIsloading(false);
          setError(error.message);
          // console.log("error", error);
        });
    }
  };

  // set all the input fields and image on initial render
  useEffect(() => {
    setImage(product.image);
    setTitle(product.title);
    setSku(product.sku);
    setQuantity(product.quantity.toString());
    setPrice(product.price.toString());
    setDescription(product.description);
    setImageId(product.imageId);
    setCategory(product.category);
    // console.log(product.imageId);
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container}>
      <StatusBar barStyle={"dark-content"} backgroundColor={colors.light} />
      <ProgressDialog visible={isloading} label={label} />
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
          <Text style={styles.screenNameText}>تعديل المنتج</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph}>تعديل تفاصيل المنتج</Text>
        </View>
      </View>
      <CustomAlert message={error} type={alertType} />
      <ScrollView style={{ flex: 1, width: "100%" }}>
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
      <View style={styles.buttomContainer}>
        <CustomButton
          text={"تعديل"}
          onPress={() => {
            upload(image);
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default EditProductScreen;

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
