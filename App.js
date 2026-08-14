import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [platforms, setPlatforms] = useState([]);
  const [name, setName] = useState("");
  const [solved, setSolved] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (platforms.length > 0) {
      AsyncStorage.setItem("platforms", JSON.stringify(platforms));
    }
  }, [platforms]);

  const loadData = async () => {
    const data = await AsyncStorage.getItem("platforms");

    if (data) {
      setPlatforms(JSON.parse(data));
    }
  };

  const addPlatform = () => {
    if (!name.trim() || !solved.trim()) {
      Alert.alert("Enter platform and solved count");
      return;
    }

    setPlatforms([
      ...platforms,
      {
        id: Date.now().toString(),
        name: name.trim(),
        solved: Number(solved),
      },
    ]);

    setName("");
    setSolved("");
  };

  const updateSolved = (id, value) => {
    setPlatforms(
      platforms.map((item) =>
        item.id === id
          ? { ...item, solved: Number(value) || 0 }
          : item
      )
    );
  };

  const deletePlatform = (id) => {
    setPlatforms(platforms.filter((item) => item.id !== id));
  };

  const total = platforms.reduce(
    (sum, item) => sum + item.solved,
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coding Progress</Text>

      <Text style={styles.total}>Total Solved: {total}</Text>

      <TextInput
        style={styles.input}
        placeholder="Platform name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Questions solved"
        keyboardType="numeric"
        value={solved}
        onChangeText={setSolved}
      />

      <TouchableOpacity style={styles.addButton} onPress={addPlatform}>
        <Text style={styles.buttonText}>Add Platform</Text>
      </TouchableOpacity>

      <FlatList
        data={platforms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.platform}>{item.name}</Text>

              <TextInput
                style={styles.numberInput}
                keyboardType="numeric"
                value={String(item.solved)}
                onChangeText={(value) =>
                  updateSolved(item.id, value)
                }
              />

              <Text>questions solved</Text>
            </View>

            <TouchableOpacity
              onPress={() => deletePlatform(item.id)}
            >
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    paddingTop: 60,
    backgroundColor: "#f5f5f5",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
  },

  total: {
    fontSize: 20,
    marginBottom: 25,
  },

  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
  },

  addButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  platform: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },

  numberInput: {
    fontSize: 24,
    fontWeight: "bold",
    width: 100,
    borderBottomWidth: 1,
    paddingVertical: 3,
  },

  delete: {
    color: "red",
  },
});