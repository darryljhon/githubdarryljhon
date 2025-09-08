import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Image,
} from "react-native";

const { width } = Dimensions.get("window");

const formatTime = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${minutes} ${ampm}`;
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [reactions, setReactions] = useState({});
  const [selectedReactionId, setSelectedReactionId] = useState(null);
  const [reactionPanelVisible, setReactionPanelVisible] = useState(false);
  const reactionPanelOpacity = useRef(new Animated.Value(0)).current;
  const [botTyping, setBotTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const scrollRef = useRef(null);

  // Typing dots animation
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const typingAnimRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, botTyping]);

  // Animate typing dots
  useEffect(() => {
    if (botTyping) {
      const makePulse = (anim, delay) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 300,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 300,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.delay(150),
          ])
        );

      const a1 = makePulse(dot1, 0);
      const a2 = makePulse(dot2, 120);
      const a3 = makePulse(dot3, 240);

      typingAnimRef.current = Animated.parallel([a1, a2, a3]);
      typingAnimRef.current.start();
    } else {
      typingAnimRef.current?.stop();
      dot1.setValue(0.3);
      dot2.setValue(0.3);
      dot3.setValue(0.3);
    }

    return () => typingAnimRef.current?.stop();
  }, [botTyping]);

  // ✅ Android-only keyboard handling
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
      scrollRef.current?.scrollToEnd({ animated: true });
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const botResponse = (userMessage) => {
    const lower = userMessage.toLowerCase();
    if (lower.includes("hello") || lower.includes("hi"))
      return "Hello there! 👋 How can I help?";
    if (lower.includes("how are you")) return "I’m fine — thanks! 😊";
    if (lower.includes("name")) return "I’m a simple Messenger Bot 🤖";
    if (lower.includes("thank")) return "You’re welcome! 👍";
    if (lower.includes("joke"))
      return "Why don’t scientists trust atoms? Because they make up everything! 😂";
    return "Sorry, I didn't get that — could you rephrase?";
  };

  const sendMessage = () => {
    const trimmed = inputText;
    if (!trimmed || !trimmed.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: trimmed,
      sender: "user",
      timestamp: formatTime(new Date()),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    setBotTyping(true);
    setTimeout(() => {
      const botMsg = {
        id: (Date.now() + 1).toString(),
        text: botResponse(trimmed),
        sender: "bot",
        timestamp: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, botMsg]);
      setBotTyping(false);
    }, 1300);
  };

  const reactionOptions = ["👍", "❤️", "😂", "😢", "😮", "😡"];

  const toggleReactionPanel = (messageId) => {
    if (selectedReactionId === messageId && reactionPanelVisible) {
      hideReactionPanel();
      return;
    }
    setSelectedReactionId(messageId);
    setReactionPanelVisible(true);
    Animated.timing(reactionPanelOpacity, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const hideReactionPanel = () => {
    Animated.timing(reactionPanelOpacity, {
      toValue: 0,
      duration: 160,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setReactionPanelVisible(false);
      setSelectedReactionId(null);
    });
  };

  const handleReactionPress = (messageId, reaction) => {
    setReactions((prev) => {
      const copy = { ...prev };
      copy[messageId] = copy[messageId] || {};
      copy[messageId][reaction] = (copy[messageId][reaction] || 0) + 1;
      return copy;
    });
    hideReactionPanel();
  };

  const renderReactionCounts = (messageId) => {
    const mr = reactions[messageId];
    if (!mr) return null;
    return (
      <View style={styles.existingReactionsContainer}>
        {Object.entries(mr).map(([emoji, count]) => (
          <View key={emoji} style={styles.reactionItem}>
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            <Text style={styles.reactionCount}>{count}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* TOP FIXED TITLE */}
        <View style={styles.topBar}>
          <Text style={styles.topText}>Messenger ni?</Text>
        </View>

        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=12" }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.chatName}>Messenger Bot</Text>
            <Text style={styles.status}>Online</Text>
          </View>
        </View>

        {/* MESSAGES */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.messagesContainer}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message) => {
              const isUser = message.sender === "user";
              return (
                <View key={message.id} style={{ marginVertical: 6 }}>
                  <View
                    style={[
                      styles.messageWrap,
                      isUser ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={[
                        styles.messageBubble,
                        isUser ? styles.userBubble : styles.botBubble,
                        isUser ? styles.userBubbleTail : styles.botBubbleTail,
                      ]}
                      onLongPress={() => toggleReactionPanel(message.id)}
                    >
                      <Text style={styles.messageText}>{message.text}</Text>
                      <Text style={styles.timestamp}>{message.timestamp}</Text>
                    </TouchableOpacity>

                    {selectedReactionId === message.id && reactionPanelVisible && (
                      <Animated.View
                        style={[
                          styles.reactionPanel,
                          {
                            opacity: reactionPanelOpacity,
                            alignSelf: isUser ? "flex-end" : "flex-start",
                          },
                        ]}
                      >
                        {reactionOptions.map((r) => (
                          <TouchableOpacity
                            key={r}
                            style={styles.reactionButton}
                            onPress={() => handleReactionPress(message.id, r)}
                          >
                            <Text style={styles.reactionEmojiLarge}>{r}</Text>
                          </TouchableOpacity>
                        ))}
                      </Animated.View>
                    )}

                    {renderReactionCounts(message.id)}
                  </View>
                </View>
              );
            })}

            {botTyping && (
              <View style={[styles.typingWrap, { alignSelf: "flex-start" }]}>
                <View style={styles.typingBubble}>
                  <Animated.View style={[styles.dot, { opacity: dot1 }]} />
                  <Animated.View style={[styles.dot, { opacity: dot2 }]} />
                  <Animated.View style={[styles.dot, { opacity: dot3 }]} />
                </View>
              </View>
            )}

            {/* Spacer for Android keyboard */}
            <View style={{ height: keyboardHeight }} />
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* INPUT BAR (emoji + send only) */}
        <View style={styles.inputContainer}>
          {/* Emoji button */}
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconEmoji}>😊</Text>
          </TouchableOpacity>

          {/* Text input */}
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            style={styles.input}
            multiline
            blurOnSubmit={false}
            maxLength={2000}
            textAlignVertical="top"
          />

          {/* ✅ Only Send button */}
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: "#007AFF" }]}
            onPress={sendMessage}
            activeOpacity={0.8}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* BOTTOM FIXED FOOTER */}
        {!isKeyboardVisible && (
          <View style={styles.bottomBar}>
            <Text style={styles.bottomText}>Messenger gyud d i</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  topBar: {
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  topText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 10 },
  chatName: { fontSize: 16, fontWeight: "700" },
  status: { color: "#3bb54a", fontSize: 12, marginTop: 2 },
  messagesContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  messageWrap: { maxWidth: width * 0.82 },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    position: "relative",
  },
  userBubble: { backgroundColor: "#DCF8C6", alignSelf: "flex-end" },
  botBubble: { backgroundColor: "#E9E9EB", alignSelf: "flex-start" },
  userBubbleTail: { borderBottomRightRadius: 4 },
  botBubbleTail: { borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16, color: "#222", lineHeight: 20 },
  timestamp: { fontSize: 11, color: "#666", marginTop: 6, textAlign: "right" },
  reactionPanel: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginTop: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  reactionButton: {
    marginHorizontal: 6,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  reactionEmojiLarge: { fontSize: 22 },
  existingReactionsContainer: {
    marginTop: 6,
    flexDirection: "row",
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    right: 0,
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 4,
  },
  reactionEmoji: { fontSize: 14 },
  reactionCount: { fontSize: 12, color: "#444", marginLeft: 4 },
  typingWrap: { marginLeft: 2, marginTop: 4 },
  typingBubble: {
    flexDirection: "row",
    backgroundColor: "#E9E9EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6b6b6b",
    marginHorizontal: 3,
    opacity: 0.3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F0F2F5",
    fontSize: 16,
    maxHeight: 120,
    marginHorizontal: 6,
  },
  sendButton: {
    marginLeft: 4,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  iconButton: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  iconEmoji: { fontSize: 22 },
  bottomBar: {
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});