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
          _id: 1,
          text: "Hello developer",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "React Native",
            avatar: "https://placeimg.com/140/140/any",
          },
        },
        {
          _id: 2,
          text: `${this.props.route.params.name} has entered the chat`,
          createdAt: new Date(),
          system: true, // system message
        },
      ],
    });
  }
  render() {
    // Username is displayed
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    // Sets selected background color from start page
    const { bgColor } = this.props.route.params;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: bgColor,
        }}
      >
        <Text>Chat Screen</Text>
        <Button
          title="Go to start"
          onPress={() => this.props.navigation.navigate("Start")}
        />
      </View>
    );
  }
}
