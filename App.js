import React, { useEffect } from "react";
import { StyleSheet, Button, View } from "react-native";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import { Alert } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
    };
  },
});

const App = () => {
  useEffect(() => {
    Permissions.getAsync(Permissions.NOTIFICATIONS)
      .then((statusObj) => {
        if (statusObj.status !== "granted") {
          return Permissions.askAsync(Permissions.NOTIFICATIONS);
        }
        return statusObj;
      })
      .then((statusObj) => {
        if (statusObj.status !== "granted") {
          Alert.alert(
            "Notifications permissions denied",
            "You will not get notifications from our app.",
            [{ text: "OK" }]
          );
          return;
        }
      });
  }, []);

  const handleNotificationTrigger = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "First local notification",
        body: "It is a text of first local notification",
      },
      trigger: {
        seconds: 5,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Button
        title="Trigger notification"
        onPress={handleNotificationTrigger}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default App;
