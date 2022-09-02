import React from "react";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
} from "react-native";

// Firebase Database
const firebase = require("firebase");
require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyB1u2WPtUeU8a9P4CXILMTmbTimMVzUiiA",
  authDomain: "chatapp-2201b.firebaseapp.com",
  projectId: "chatapp-2201b",
  storageBucket: "chatapp-2201b.appspot.com",
  messagingSenderId: "768165975127",
  appId: "1:768165975127:web:863bfba636567f3ab1bf12",
  measurementId: "G-F1K35KGGWV",
};

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
    };
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    // reference to messages collection
    this.referenceChatMessages = firebase.firestore().collection("messages");
  }

        },
  componentDidMount() {
    // required for listing name in default message
    // used to display title/name at very top of page
    let { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });

    // reference to messages collection
    this.referenceChatMessages = firebase.firestore().collection("messages");
    // authentication listener
    this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
      }

      // update user state
      this.setState({
        uid: user.uid,
        messages: [],
        loggedInText: "You are logged in",
        user: {
          _id: user._id,
          name: name,
          avatar: "https://placeholder.com/140/140/any",
        },
      });
      // reference to active messages collection
      this.referenceMessagesUser = firebase
        .firestore()
        .collection("messages")
        .where("uid", "==", this.state.uid);

      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
    });
  }

  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
  }

  // customize style of message bubble
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#5c5d5e",
          },
        }}
      />
    );
  }

  render() {
    // sets selected background color from start page
    let { bgColor } = this.props.route.params;
    // Username is displayed
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    return (
      <View
        style={{
          backgroundColor: bgColor,
          flex: 1,
        }}
      >
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />

        {/* Accessibility */}
        <TouchableOpacity
          accessible={true}
          accessibilityLabel="More options"
          accessibilityHint="Lets you choose to send an image or your geolocation."
          accessibilityRole="button"
          onPress={this._onPress}
        >
          <View>
            <Text>Send an Image or share Geolocation</Text>
          </View>
        </TouchableOpacity>

        {/* component for Android so that the input field won’t be hidden beneath the keyboard */}
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}
