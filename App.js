import { StatusBar } from "expo-status-bar";
import React, { useState, useRef } from "react";
import { View, Button, StyleSheet, Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function App() {
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef(null);

  const injectedJavaScript = `
    console.log("🚀 WebView script injected!");
    window.open = function(url) {
        console.log("🌍 Mở URL:", url);
        window.ReactNativeWebView.postMessage('asdasd');
    };
    window.close = function() {
        console.log("❌ Cửa sổ đóng");
        window.ReactNativeWebView.postMessage('WINDOW_CLOSED');
    };
  `;

  const handleWebViewMessage = (event) => {
    const message = event.nativeEvent.data;
    console.log(message);
    console.log("Nhận event từ WebView:", event);

    if (message === "WINDOW_CLOSED") {
      webViewRef.current.injectJavaScript(`
        window.location.href = "https://sellmycar.702prime.com/myAccount?tab=managementAccountInfo";
      `);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        {/* Đặt StatusBar để tránh nội dung bị che */}
        <StatusBar style="auto" />

        {/* Nút Back chỉ hiển thị khi có thể quay lại */}
        {canGoBack && (
          <View style={styles.backButtonContainer}>
            <Button title="🔙" onPress={() => webViewRef.current.goBack()} />
          </View>
        )}

        {/* WebView phải có `flex: 1` để chiếm toàn bộ màn hình */}
        <WebView
          mixedContentMode="always"
          originWhitelist={["*"]}
          style={styles.webView}
          ref={webViewRef}
          source={{ uri: "https://sellmycar.702prime.com" }}
          injectedJavaScript={injectedJavaScript}
          onMessage={handleWebViewMessage}
          onShouldStartLoadWithRequest={(request) => {
            console.log("Request:", request);
            return true;
          }}
          onNavigationStateChange={(navState) => {
            if (!navState.url.includes("sellmycar.702prime.com")) {
              setCanGoBack(true);
            } else {
              setCanGoBack(false);
            }
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webView: {
    flex: 1, // Giúp WebView chiếm toàn bộ màn hình
  },
  backButtonContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40, // Điều chỉnh top cho iOS
    left: 10,
    zIndex: 10,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
  },
});
