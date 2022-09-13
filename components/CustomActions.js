import React from "react";
import PropTypes from "prop-types";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import firebase from "firebase";
import firestore from "firebase";
import { TouchableOpacity, View, StyleSheet, Text } from "react-native";

export default class CustomActions extends React.Component {
  // allows the user to pick an existing image from their device’s media library
  pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    try {
      if (status === "granted") {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "Images",
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImageFetch(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

