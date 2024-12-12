"use client";

import { supabase } from "../lib/supabaseClient"; // Correct path to your Supabase client
import React, { useState, FormEvent } from "react";
import "./Chatbot.css"; // Import the CSS file

// Define types for messages
interface Message {
  text: string;
  sender: "user" | "bot";
}

const Chatbox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const initialGreeting = "How can I assist you today?";
  const options = [
    "1) Total sales amount and product count based on date",
    "2) Total people at a particular date",
  ];

  const handleGreetingClick = () => {
    if (isOpen) {
      setIsOpen(false); // Close chatbot
    } else {
      setShowOptions(true);
      setMessages((prev) => [
        ...prev,
        { text: initialGreeting, sender: "bot" },
      ]);
      setIsOpen(true); // Open chatbot
    }
  };

  const fetchSalesData = async (option: number, date: string = ""): Promise<JSX.Element | string> => {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return `The date "${date}" is invalid. Please provide a valid date.`;
      }
      const formattedDate = parsedDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD

      if (option === 1) {
        const { data, error } = await supabase
          .from("payments")
          .select("*")
          .eq("PaymentDate", formattedDate);

        if (error) throw error;

        if (data.length === 0) {
          return `No sales recorded on ${date}.`;
        } else {
          let totalAmount = 0;
          let totalItemCount = 0;
          let itemsSold = "";

          data.forEach((payment) => {
            const cartItems = Array.isArray(payment.cart)
              ? payment.cart
              : JSON.parse(payment.cart);

            if (cartItems.length > 0) {
              cartItems.forEach((cartItem) => {
                const itemTotal = cartItem.price * cartItem.quantity;
                totalAmount += itemTotal;
                totalItemCount += cartItem.quantity;
                itemsSold += `${cartItem.name} (Quantity: ${cartItem.quantity}): ₹${itemTotal.toFixed(
                  2
                )}, `;
              });
            }
          });

          itemsSold = itemsSold.slice(0, -2); // Remove trailing comma and space
          const currentTime = new Date().toISOString();

          return (
            <>
              Sales on {date}:<br />
              Total sales amount: <strong>₹{totalAmount.toFixed(2)}</strong>
              <br />
              Total items sold: <strong>{totalItemCount}</strong>
              <br />
              Timestamp at request: <strong>{currentTime}</strong>
            </>
          );
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return "Sorry, there was an error fetching the data.";
    }
  };

  const fetchPeopleCount = async (date: string): Promise<string> => {
    try {
      const [year, month, day] = date.split("-");
      const formattedStartDate = `${year}-${month}-${day} 00:00:00`;
      const formattedEndDate = `${year}-${month}-${day} 23:59:59`;

      const { data, error } = await supabase
        .from("peopledata")
        .select("lastCount, timestamp")
        .gte("timestamp", formattedStartDate)
        .lte("timestamp", formattedEndDate);

      if (error) throw error;

      if (data.length === 0) {
        return `No records found for ${date}.`;
      } else {
        const totalCount = data.reduce(
          (acc, record) => acc + (parseInt(record.lastCount, 10) || 0),
          0
        );
        return `Total people counted on ${date}: ${totalCount}`;
      }
    } catch (error) {
      console.error("Error fetching people count:", error);
      return "Sorry, there was an error fetching the people count.";
    }
  };

  const handleOptionSelect = (option: number) => {
    setMessages((prev) => [
      ...prev,
      { text: `You selected: ${options[option - 1]}`, sender: "user" },
    ]);
    setSelectedOption(option);
    setShowOptions(false);
    setMessages((prev) => [
      ...prev,
      { text: "Please provide a date (YYYY-MM-DD):", sender: "bot" },
    ]);
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);

    if (selectedOption) {
      if (input.match(/^\d{4}-\d{2}-\d{2}$/)) {
        let responseMessage: JSX.Element | string = "";
        if (selectedOption === 1) {
          responseMessage = await fetchSalesData(selectedOption, input);
        } else if (selectedOption === 2) {
          responseMessage = await fetchPeopleCount(input);
        }

        setMessages((prev) => [
          ...prev,
          { text: responseMessage, sender: "bot" },
          { text: "Do you want more help? (Yes/No)", sender: "bot" },
        ]);
        setInput("");
        setSelectedOption(null);
        return;
      } else {
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, I can’t understand. Please provide a valid date in YYYY-MM-DD format.",
            sender: "bot",
          },
        ]);
        setInput("");
        return;
      }
    }

    if (input.toLowerCase() === "yes") {
      setShowOptions(true);
    } else if (input.toLowerCase() === "no") {
      setMessages((prev) => [
        ...prev,
        { text: "Thank you! If you want to start again, type 'analysis'.", sender: "bot" },
      ]);
    } else if (input.toLowerCase() === "analysis") {
      handleGreetingClick();
    } else {
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, I can't understand you. Please type 'Yes' or 'No'.", sender: "bot" },
      ]);
    }
    setInput("");
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-header">
        <img
          src="/images/chat.png"
          alt="Chatbot icon"
          onClick={handleGreetingClick}
          className="chatbot-icon"
        />
      </div>
      {isOpen && (
        <div className="chatbox-body">
          <div className="chatbox-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <p>
                  <strong>{message.sender === "user" ? "User" : "Bot"}:</strong> {message.text}
                </p>
              </div>
            ))}
          </div>
          {showOptions && (
            <div className="chatbox-options">
              {options.map((option, index) => (
                <button key={index} onClick={() => handleOptionSelect(index + 1)}>
                  {option}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleSend} className="chatbox-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message"
              className="chatbox-input"
            />
            <button type="submit" className="chatbox-button">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbox;
