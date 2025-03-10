# WebSocket Server

A simple WebSocket server built with Node.js, Express, and the ws library.

## Features

- WebSocket server with JSON message support
- Simple HTTP server for health checks
- Browser-based client for testing
- Message echo functionality

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

## Usage

### Starting the Server

Start the WebSocket server:

```bash
npm start
```

The server will run on port 3000 by default. You can change this by setting the `PORT` environment variable.

### Testing with the Client

1. Start the server as described above
2. Open the `client.html` file in your web browser
3. Click the "Connect" button to establish a WebSocket connection
4. Type messages in the input field and click "Send" to send them to the server
5. The server will echo your messages back

### WebSocket API

The WebSocket server expects and sends JSON messages. Messages should be in the following format:

```json
{
  "text": "Your message here",
  "timestamp": "2023-06-15T12:34:56.789Z"
}
```

The server will respond with messages in the following format:

```json
{
  "type": "echo",
  "data": {
    "text": "Your message here",
    "timestamp": "2023-06-15T12:34:56.789Z"
  }
}
```

## Customizing the Server

You can modify the `server.js` file to add custom message handling logic or additional features.

## License

ISC 