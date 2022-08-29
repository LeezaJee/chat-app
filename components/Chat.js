import React from "react";
import {
  View,
  Text,
  Button,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
    };
  }

  componentDidMount() {
    this.setState({
      messages: [
        {
          _id: 2,
          text: "How are your studies going?",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "React Native",
            avatar: "https://placeimg.com/140/140/any",
          },
        },
        {
          _id: 1,
          text: "Hello developer!",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "React Native",
            avatar: "https://placeimg.com/140/140/any",
          },
        },

        {
          _id: 3,
          text: `${this.props.route.params.name} has entered the chat`,
          createdAt: new Date(),
          system: true, // system message
        },
      ],
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
    // Username is displayed
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    // Sets selected background color from start page
    const { bgColor } = this.props.route.params;

    return (
      <View style={{ flex: 1 }}>
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
