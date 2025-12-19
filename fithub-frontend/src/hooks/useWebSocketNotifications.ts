import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

interface NotificationMessage {
  message: string;
}

export const useWebSocketNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [stompClient, setStompClient] = useState<any | null>(null); // Changed type to any

  useEffect(() => {
    if (!userId) {
      console.warn("User ID not available for WebSocket notifications.");
      return;
    }

    const socket = new SockJS('http://localhost:8081/ws'); // Connect to notification-service WebSocket endpoint
    const client = Stomp.over(socket);

    const onConnect = (frame: any) => {
      console.log('Connected to WebSocket:', frame);
      setStompClient(client);

      // Subscribe to user-specific queue
      client.subscribe(`/user/${userId}/queue/notifications`, (message: any) => {
        const receivedMessage: NotificationMessage = JSON.parse(message.body);
        setNotifications((prev) => [...prev, receivedMessage.message]);
        console.log('Received in-app notification:', receivedMessage.message);
        alert(`New in-app notification for ${userId}: ${receivedMessage.message}`);
      });
    };

    const onError = (error: any) => {
      console.error('Broker reported error:', error);
    };

    client.connect({}, onConnect, onError);

    return () => {
      if (client && client.connected) { // Check if client exists and is connected before disconnecting
        client.disconnect(() => {
          console.log('Disconnected from WebSocket');
        });
      }
    };
  }, [userId]);

  return { notifications, stompClient };
};
