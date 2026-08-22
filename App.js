import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { io } from "socket.io-client";

const SERVER_URL = "https://anon-chat-e7x5.onrender.com";

// Generate random 3-char UID like "A3x" — same logic as website
const generateUID = () => {
  const c1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const c2 = Math.floor(Math.random() * 10);
  const c3 = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  return `${c1}${c2}${c3}`;
};

export default function App() {
  const uid = useMemo(() => generateUID(), []);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const flatListRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ["websocket"],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("chat message", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          uid: msg.uid,
          text: msg.text,
          timestamp: new Date(),
        },
      ]);
    });

    socket.on("user count", (count) => {
      setOnlineCount(count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || !socketRef.current) return;
    socketRef.current.emit("chat message", { uid, text });
    setInputText("");
  };

  const renderMessage = ({ item }) => {
    const isMe = item.uid === uid;
    return (
      <View
        style={[
          styles.messageBubbleRow,
          isMe ? styles.myRow : styles.otherRow,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myBubble : styles.otherBubble,
          ]}
        >
          <Text style={[styles.uidText, isMe ? styles.myUid : styles.otherUid]}>
            {item.uid}
          </Text>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const hasMessages = messages.length > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoRow}>
            <Text style={styles.logoIcon}>⬡</Text>
            <Text style={styles.logoText}>AnonChat</Text>
          </View>
          <Text style={styles.tagline}>speak freely</Text>
        </View>
        <View style={styles.onlineBadge}>
          <View
            style={[
              styles.pulseDot,
              { backgroundColor: connected ? "#34d399" : "#ef4444" },
            ]}
          />
          <Text style={styles.onlineText}>{onlineCount} online</Text>
        </View>
      </View>

      {/* Messages Area */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        {!hasMessages ? (
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeIcon}>🔒</Text>
              <Text style={styles.welcomeTitle}>Welcome to AnonChat</Text>
              <Text style={styles.welcomeSubtitle}>
                Messages are not stored. Say something!
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#6b7280"
              value={inputText}
              onChangeText={setInputText}
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
              activeOpacity={0.7}
            >
              {/* Paper plane SVG approximated with unicode + styling */}
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a1a",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
  },

  // ── Header ──────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerLeft: {
    flexDirection: "column",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    fontSize: 22,
    color: "#a78bfa",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#a78bfa",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineText: {
    fontSize: 13,
    color: "#86efac",
    fontWeight: "600",
  },

  // ── Chat Area ───────────────────────────
  chatArea: {
    flex: 1,
  },

  // ── Welcome ─────────────────────────────
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  welcomeCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  welcomeIcon: {
    fontSize: 36,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Messages ────────────────────────────
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageBubbleRow: {
    marginBottom: 12,
    flexDirection: "row",
  },
  myRow: {
    justifyContent: "flex-end",
  },
  otherRow: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: "#6366f1",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#1f2937",
    borderBottomLeftRadius: 4,
  },
  uidText: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  myUid: {
    color: "rgba(255,255,255,0.6)",
  },
  otherUid: {
    color: "#818cf8",
  },
  messageText: {
    fontSize: 15,
    color: "#f9fafb",
    lineHeight: 21,
  },

  // ── Input Bar ───────────────────────────
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "android" ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    backgroundColor: "#0f1120",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1d2e",
    borderRadius: 25,
    paddingLeft: 18,
    paddingRight: 5,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#f9fafb",
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#374151",
  },
  sendIcon: {
    color: "#ffffff",
    fontSize: 18,
    marginLeft: 2,
  },
});