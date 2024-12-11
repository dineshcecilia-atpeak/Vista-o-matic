"use client";

import { supabase } from "../lib/supabaseClient"; // Correct path to your supabaseClient
import React, { useState, FormEvent } from "react";
import "./Chatbot.css"; // Import the CSS file

// Define types for messages and options
interface Message {
  text: string;
  sender: "user" | "bot";
}

const Chatbox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null); // Keep track of the selected option

  const initialGreeting = "How can I assist you today?";
  const options = [
    "1) Total sales amount and product count based on date",
    "2) Total people at a particular date",
  ];

  const handleGreetingClick = () => {
    if (isOpen) {
      // Close the chatbot if it's open and clear the chat
      setIsOpen(false);
      setMessages([]); // Clear the chat when closing
    } else {
      // Open the chatbot and show options
      setShowOptions(true);
      const greetingMessage: Message = { text: initialGreeting, sender: "bot" };
      setMessages((prev) => [...prev, greetingMessage]);
      setIsOpen(true); // Open chatbot on greeting click
    }
  };

  const fetchSalesData = async (option: number, date: string = ""): Promise<JSX.Element | string> => {
    let responseMessage = "";
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
          responseMessage = `No sales recorded on ${date}.`;
        } else {
          let totalAmount = 0;
          let totalItemCount = 0;
          let itemsSold = "";

          data.forEach((payment) => {
            const cartItems = typeof payment.cart === "object" ? payment.cart : JSON.parse(payment.cart);

            if (cartItems.length > 0) {
              const itemDetails = cartItems.map((cartItem) => {
                const itemTotal = cartItem.price * cartItem.quantity;
                totalAmount += itemTotal;
                totalItemCount += cartItem.quantity;
                return `${cartItem.name} (Quantity: ${cartItem.quantity}): ₹${itemTotal.toFixed(2)}`;
              }).join(", ");

              itemsSold += itemDetails + ", ";
            }
          });

          itemsSold = itemsSold.slice(0, -2); // Remove trailing comma and space
          const currentTime = new Date();
          const formattedCurrentTime = currentTime.toISOString();

          responseMessage = (
            <>
              Sales on {date}:<br />
              Total sales amount: <strong>₹{totalAmount.toFixed(2)}</strong><br />
              Total items sold: <strong>{totalItemCount}</strong><br />
              Timestamp at request: <strong>{formattedCurrentTime}</strong>
            </>
          );
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      responseMessage = "Sorry, there was an error fetching the data.";
    }
    return responseMessage;
  };

  const fetchPeopleCount = async (date: string): Promise<string> => {
    let responseMessage = "";
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
        responseMessage = `No records found for ${date}.`;
      } else {
        const totalCount = data.reduce(
          (acc, record) => acc + parseInt(record.lastCount, 10) || 0,
          0
        );
        responseMessage = `Total people counted on ${date}: ${totalCount}`;
      }
    } catch (error) {
      console.error("Error fetching people count:", error);
      responseMessage = "Sorry, there was an error fetching the people count.";
    }
    return responseMessage;
  };

  const handleOptionSelect = (option: number) => {
    const newMessage: Message = { text: `You selected: ${options[option - 1]}`, sender: "user" };
    setMessages((prev) => [...prev, newMessage]);
    setSelectedOption(option);
    setShowOptions(false);

    const responseMessage: Message = {
      text: "Please provide a date (YYYY-MM-DD):",
      sender: "bot",
    };
    setMessages((prev) => [...prev, responseMessage]);
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const newMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, newMessage]);

    if (selectedOption) {
      if (input.match(/^\d{4}-\d{2}-\d{2}$/)) {
        let responseMessage = "";
        if (selectedOption === 1) {
          responseMessage = await fetchSalesData(selectedOption, input);
        } else if (selectedOption === 2) {
          responseMessage = await fetchPeopleCount(input);
        }

        const botResponse: Message = { text: responseMessage || "I'm not sure how to answer that.", sender: "bot" };
        setMessages((prev) => [...prev, botResponse]);
        setInput("");
        setSelectedOption(null);

        const moreHelpMessage: Message = { text: "Do you want more help? (Yes/No)", sender: "bot" };
        setMessages((prev) => [...prev, moreHelpMessage]);
        return;
      } else {
        const botResponse: Message = {
          text: 'Sorry, I can’t understand. Please provide a valid date in YYYY-MM-DD format.',
          sender: "bot",
        };
        setMessages((prev) => [...prev, botResponse]);
        setInput("");
        return;
      }
    }

    // Handling "Yes" or "No" for more help
    if (input.toLowerCase() === "yes") {
      setShowOptions(true);
    } else if (input.toLowerCase() === "no") {
      const thankYouMessage: Message = { text: "Thank you! If you want to start again, type 'analysis'.", sender: "bot" };
      setMessages((prev) => [...prev, thankYouMessage]);
    } else if (input.toLowerCase() === "analysis") {
      handleGreetingClick();
    } else {
      const botResponse: Message = {
        text: "Sorry, I can't understand you. Please type 'Yes' or 'No'.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botResponse]);
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
