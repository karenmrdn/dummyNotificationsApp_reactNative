import React, { useEffect, useState } from "react";
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

// https://expo.dev/notifications
const App = () => {
  const [pushToken, setPushToken] = useState();

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
          throw new Error("You will not get notifications from our app.");
        }
      })
      .then(() => {
        return Notifications.getExpoPushTokenAsync();
      })
      .then((response) => {
        const token = response.data;
        setPushToken(token);

        // We need to store this token in our own api to
        // be able to send notifications not only on our device
        // but also on device of other user of this app
      })
      .catch((error) => {
        Alert.alert("Notifications permissions denied", error.message, [
          { text: "OK" },
        ]);
      });
  }, []);

  useEffect(() => {
    // this function runs whenever user PRESS on a notification in a background
    const backgroundSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    // this function runs whenever user get a notification in a foreground
    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(notification);
      });

    return () => {
      foregroundSubscription.remove();
      backgroundSubscription.remove();
    };
  }, []);

  const handleNotificationTrigger = () => {
    // Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: "First local notification",
    //     body: "It is a text of first local notification",
    //     data: { mySuperImportantData: "I am engineer" },
    //   },
    //   trigger: {
    //     seconds: 5,
    //   },
    // });

    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Ending": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        title: "Sent via the app",
        body: "This push notifications was sent via the app!",
        data: { extraData: "Some additional data" },
      }),
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
