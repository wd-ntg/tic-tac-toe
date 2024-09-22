import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

type ChatProps = {
  roomId: string;
};

export const Chat = ({ roomId }: ChatProps) => {
  const socket = useSelector((state: any) => state.socket.socket);
  const player = useSelector((state: any) => state.game.namePlayer);

  const [messages, setMessages] = useState<{ user: string; message: string }[]>(
    () => {
      // Khôi phục tin nhắn từ localStorage khi component được mount
      const savedMessages = localStorage.getItem(`chat_${roomId}`);
      return savedMessages ? JSON.parse(savedMessages) : [];
    }
  );

  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    // Lưu trữ tin nhắn vào localStorage mỗi khi messages thay đổi
    localStorage.setItem(`chat_${roomId}`, JSON.stringify(messages));
  }, [messages, roomId]);

  useEffect(() => {
    socket.on("receive_message", (data: any) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { user: data.user, message: data.message },
      ]);
    });

    socket.on("receive_message_history", (data: any) => {
        setMessages(data.messages);
      });

    return () => {
      socket.off("receive_message");
      socket.off("receive_message_history");
    };
  }, [socket]);

  const sendMessage = () => {
    if (inputMessage.trim() !== "") {
      socket.emit("send_message", {
        user: player,
        message: inputMessage,
        roomId,
      });

      setMessages((prevMessages) => [
        ...prevMessages,
        { user: player, message: inputMessage },
      ]);
      setInputMessage("");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 fixed bottom-0 right-0">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-4">
          <div className="ml-3">
            <p className="text-xl font-medium">Chat</p>
            <p className="text-gray-500">In Room: {roomId}</p>
          </div>
        </div>

        {/* Hiển thị tin nhắn */}
        <div className="space-y-4 h-[280px] overflow-y-scroll">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start ${
                msg.user === player ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg ${
                  msg.user === player
                    ? "bg-blue-100 text-right"
                    : "bg-gray-100 text-left"
                }`}
                style={{ maxWidth: "70%" }}
              >
                <p className="text-sm text-gray-800">
                  <strong>{msg.user}:</strong> {msg.message}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input cho tin nhắn */}
        <div className="mt-4 flex items-center">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 py-2 px-3 rounded-full bg-gray-100 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-full ml-3 hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
