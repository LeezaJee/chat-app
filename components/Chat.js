import React from "react";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

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
      isConnected: false,
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
    this.referenceMessagesUser = null;
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

    // retrieves chat messages from asyncStorage instead of filling message state with static data
    this.getMessages();

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
          // anonymous user doesn't have _id attached to user object so the app breaks when trying to send a message
          // when you hit send message, the app doesn't know what _id stands for
          // thus, || user.uid was added because it is the only unique thing that can be used else
          _id: user._id || user.uid,
          name: name,
          avatar: "https://placeholder.com/140/140/any",
        },
      });

      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
    });

    // reference to active messages collection
    this.referenceMessagesUser = firebase
      .firestore()
      .collection("messages")
      .where("uid", "==", this.state.uid);

    // checks if user is online or not
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.setState({ isConnected: true });
        console.log("online");
      } else {
        this.setState({ isConnected: false });
        console.log("offline");
      }
    });
  }

  // retrieve chat messages from asyncStorage
  async getMessages() {
    let messages = "";
    try {
      messages = (await AsyncStorage.getItem("messages")) || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  }

  // Add messages to state
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage(messages[0]);
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

        {/* component for Android so that the input field won’t be hidden beneath the keyboard */}
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}
