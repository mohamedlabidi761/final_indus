#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// WebSocket server details
const char* websocket_server = "192.168.1.100"; // Replace with your server IP
const uint16_t websocket_port = 3000;

// Device information
const char* deviceId = "esp8266_sensor_1"; // Unique ID for this device
const char* deviceName = "Industrial Sensor"; // Human-readable name
const char* deviceType = "industrial"; // Type of device

// Sensor pins
#define DHTPIN D4        // DHT11 data pin
#define DHTTYPE DHT11    // DHT sensor type
#define VIBRATION_PIN D2 // Vibration sensor pin
#define LIGHT_PIN A0     // Light sensor analog pin

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// WebSocket client
WebSocketsClient webSocket;

// Variables for timing
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 5000; // Send data every 5 seconds
unsigned long lastReconnectAttempt = 0;
const unsigned long reconnectInterval = 5000; // Try to reconnect every 5 seconds

// Connection status
bool isRegistered = false;

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  Serial.println();
  Serial.println("ESP8266 Industrial IoT Sensor Node");
  
  // Initialize sensor pins
  pinMode(VIBRATION_PIN, INPUT);
  
  // Initialize DHT sensor
  dht.begin();
  
  // Connect to WiFi
  connectToWiFi();
  
  // Setup WebSocket connection
  setupWebSocket();
}

void loop() {
  // Handle WebSocket events
  webSocket.loop();
  
  // Check connection status
  if (!webSocket.isConnected()) {
    // Try to reconnect if not connected
    unsigned long currentMillis = millis();
    if (currentMillis - lastReconnectAttempt >= reconnectInterval) {
      lastReconnectAttempt = currentMillis;
      Serial.println("Attempting to reconnect...");
      webSocket.disconnect();
      setupWebSocket();
    }
    return;
  }
  
  // Send registration if not registered
  if (!isRegistered) {
    registerDevice();
    return;
  }
  
  // Send sensor data at regular intervals
  unsigned long currentMillis = millis();
  if (currentMillis - lastSendTime >= sendInterval) {
    lastSendTime = currentMillis;
    sendSensorData();
  }
}

void connectToWiFi() {
  Serial.printf("Connecting to %s ", ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());
}

void setupWebSocket() {
  // Server address, port, and URL path
  webSocket.begin(websocket_server, websocket_port, "/");
  
  // Event handler
  webSocket.onEvent(webSocketEvent);
  
  // Set reconnect interval
  webSocket.setReconnectInterval(5000);
  
  Serial.println("WebSocket client setup completed");
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("Disconnected from WebSocket server");
      isRegistered = false;
      break;
      
    case WStype_CONNECTED:
      Serial.println("Connected to WebSocket server");
      // Register device after connection
      registerDevice();
      break;
      
    case WStype_TEXT:
      handleServerMessage(payload, length);
      break;
      
    case WStype_ERROR:
      Serial.println("WebSocket error");
      break;
  }
}

void handleServerMessage(uint8_t * payload, size_t length) {
  // Parse JSON message
  DynamicJsonDocument doc(1024);
  DeserializationError error = deserializeJson(doc, payload, length);
  
  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    return;
  }
  
  // Process message based on type
  const char* type = doc["type"];
  
  if (strcmp(type, "registered") == 0) {
    isRegistered = true;
    Serial.println("Device successfully registered with server");
  }
  else if (strcmp(type, "data_received") == 0) {
    Serial.println("Server acknowledged data receipt");
  }
  else {
    Serial.print("Received message: ");
    Serial.println((char*)payload);
  }
}

void registerDevice() {
  if (!webSocket.isConnected()) {
    return;
  }
  
  // Create JSON document for registration
  DynamicJsonDocument doc(256);
  
  doc["type"] = "register";
  doc["deviceId"] = deviceId;
  doc["name"] = deviceName;
  doc["type"] = deviceType;
  doc["chipId"] = ESP.getChipId();
  doc["macAddress"] = WiFi.macAddress();
  
  // Serialize JSON to string
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send registration message
  webSocket.sendTXT(jsonString);
  Serial.println("Sent registration request");
}

void sendSensorData() {
  if (!webSocket.isConnected() || !isRegistered) {
    return;
  }
  
  // Read DHT11 sensor
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  
  // Read vibration sensor (digital)
  int vibration = digitalRead(VIBRATION_PIN);
  
  // Read light sensor (analog)
  int lightLevel = analogRead(LIGHT_PIN);
  // Convert analog reading (0-1023) to percentage (0-100)
  int lightPercentage = map(lightLevel, 0, 1023, 0, 100);
  
  // Check if any readings failed
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    // Still send other sensor data
    humidity = -1;
    temperature = -1;
  }
  
  // Create JSON document
  DynamicJsonDocument doc(512);
  
  // Basic info
  doc["device"] = deviceId;
  doc["timestamp"] = millis();
  
  // Sensor data
  JsonObject sensors = doc.createNestedObject("sensors");
  sensors["temperature"] = temperature;
  sensors["humidity"] = humidity;
  sensors["vibration"] = vibration;
  sensors["light"] = lightPercentage;
  
  // System info
  JsonObject system = doc.createNestedObject("system");
  system["uptime"] = millis() / 1000;
  system["freeHeap"] = ESP.getFreeHeap();
  system["rssi"] = WiFi.RSSI();
  
  // Serialize JSON to string
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send data
  webSocket.sendTXT(jsonString);
  Serial.println("Sent sensor data");
  
  // Also print to serial for debugging
  Serial.printf("Temperature: %.2f°C, Humidity: %.2f%%, Vibration: %d, Light: %d%%\n", 
                temperature, humidity, vibration, lightPercentage);
} 