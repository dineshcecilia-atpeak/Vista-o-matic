"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Table, Form, Alert } from "react-bootstrap";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [name, setName] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);
  };

  const handlePayment = async () => {
    if (!name || cart.length === 0) {
      setError("Please enter your name and ensure cart is not empty.");
      return;
    }

    const { error } = await supabase.from("payments").insert({
      cart,
      price: parseFloat(calculateTotal()),
      Name: name,
      PaymentDate: new Date().toISOString().slice(0, 10),
    });

    if (error) {
      console.error("Supabase error:", error.message);
      setError("Failed to process payment.");
    } else {
      setPaymentSuccess(true);
      localStorage.removeItem("cart");
      setCart([]);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center" style={{ padding: "2rem", backgroundColor: "#fff", minHeight: "100vh" }}>
      <Card className="shadow-sm" style={{ width: "100%", maxWidth: "700px" }}>
        <Card.Body>
          <Card.Title className="fw-bold mb-4" style={{ fontSize: "2rem", color: "#2C3E50" }}>
            Checkout
          </Card.Title>

          {paymentSuccess ? (
            <>
              <Alert variant="success" className="mb-4">✅ Payment successful!</Alert>
              <Button variant="outline-primary" onClick={() => router.push("/")}>
                ← Back to home
              </Button>
            </>
          ) : (
            <>
              {error && <Alert variant="danger">{error}</Alert>}

              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price (₹)</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length > 0 ? (
                    cart.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>₹{item.price.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>No items in cart.</td>
                    </tr>
                  )}
                </tbody>
              </Table>

              <h5>Total: ₹{calculateTotal()}</h5>

              <Form className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label>Your Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>
                <Button variant="success" onClick={handlePayment}>
                  Confirm Payment
                </Button>
              </Form>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Checkout;
