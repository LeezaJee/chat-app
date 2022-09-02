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
      firebase.initializeApp({
        apiKey: "AIzaSyB1u2WPtUeU8a9P4CXILMTmbTimMVzUiiA",
        authDomain: "chatapp-2201b.firebaseapp.com",
        projectId: "chatapp-2201b",
        storageBucket: "chatapp-2201b.appspot.com",
        messagingSenderId: "768165975127",
        appId: "1:768165975127:web:863bfba636567f3ab1bf12",
        measurementId: "G-F1K35KGGWV",
      });
    }
    // reference to messages collection
    this.referenceChatMessages = firebase.firestore().collection("messages");
  }

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each doc
    querySnapshot.forEach((doc) => {
      // get the queryDocumentSnapshots data
      var data = doc.data();
      messages.push({
        _id: data._id,
        createdAt: data.createdAt.toDate(),
        text: data.text,
        uid: data.uid,
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
      });
    });
    this.setState({
      messages,
    });
  };

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

  // Add messages to state
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
      }
    );
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

  // adds messages to store
  addMessage = (message) => {
    this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      createdAt: message.createdAt,
      text: message.text,
      user: message.user,
    });
  };

  componentWillUnmount() {
    // unsubscribe() used to stop receiving updates from collection
    this.unsubscribe();
    this.authUnsubscribe();
  }

  render() {
    // sets selected background color from start page
    // name = username displayed
    let { bgColor, name } = this.props.route.params;

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
            _id: this.state.user._id,
            name: name,
            avatar: this.state.user.avatar,
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
