"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Alert,
  Button,
  Form,
  Container,
  Navbar,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

const QRScanner = () => {
  const [scannedData, setScannedData] = useState("");
  const [cart, setCart] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProductScanned, setIsProductScanned] = useState(false);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [generatedData, setGeneratedData] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const loadScanner = async () => {
      const { Html5QrcodeScanner } = await import("html5-qrcode");
      const scanner = new Html5QrcodeScanner("reader", {
        qrbox: { width: 250, height: 250 },
        fps: 10,
      });
      scanner.render(
        (result) => {
          if (!isProductScanned) handleScan(result);
        },
        (err) => console.error("QR Scan Error", err)
      );
    };
    loadScanner();
  }, [isProductScanned]);

  const handleScan = (data) => {
    const productInfo = parseProductData(data);
    if (productInfo) {
      addProductToCart(productInfo);
    } else {
      setErrorMessage("Invalid QR data format. Please scan again.");
    }
  };

  const parseProductData = (data) => {
    try {
      const parts = data.split(";");
      if (parts.length === 2) {
        const name = parts[0].split(":")[1].trim();
        const price = parseFloat(parts[1].split(":")[1].trim());
        return { name, price };
      }
    } catch (err) {
      console.error("Parsing error", err);
    }
    return null;
  };

  const addProductToCart = ({ name, price }) => {
    if (cart.find((item) => item.name === name)) {
      setErrorMessage("Product already in cart.");
      return;
    }
    setCart([...cart, { name, price, quantity: 1 }]);
    setScannedData(name);
    setErrorMessage("");
    setIsProductScanned(true);
    setTimeout(() => setIsProductScanned(false), 1000);
  };

  const updateQuantity = (name, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.name === name
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (name) => {
    setCart((prev) => prev.filter((item) => item.name !== name));
  };

  const calculateTotalPrice = () =>
    cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);

  const handleGenerate = () => {
    if (productName && price) {
      setGeneratedData(`name:${productName};price:${price}`);
    }
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <Container className="py-5 d-flex flex-column align-items-center">
        <Navbar className="w-100 py-2" style={{ backgroundColor: "transparent" }}>
          <Button variant="link" className="text-dark" onClick={() => router.back()}>
            ← Back
          </Button>
        </Navbar>

        <h1
          className="fw-bold text-center mb-4"
          style={{
            fontSize: "3rem",
            color: "#2C3E50",
            animation: "fadeSlideIn 1s ease-in-out",
            letterSpacing: "1px",
          }}
        >
          QR Scanner
        </h1>

        <style jsx>{`
          @keyframes fadeSlideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        <div id="reader" style={{ width: "100%", maxWidth: "600px" }}></div>

        {scannedData && <Alert variant="success" className="mt-3">Scanned: {scannedData}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <Card className="shadow-sm rounded-3 my-4 w-100" style={{ maxWidth: "600px" }}>
          <Card.Body>
            <Card.Title className="mb-3">Cart</Card.Title>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price (₹)</th>
                  <th>Qty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.length > 0 ? (
                  cart.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>₹{item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => updateQuantity(item.name, 1)}
                        >
                          +
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          className="mx-2"
                          onClick={() => updateQuantity(item.name, -1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => removeItem(item.name)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="text-center">No items in cart.</td></tr>
                )}
              </tbody>
            </Table>
            <h5>Total: ₹{calculateTotalPrice()}</h5>

            <Link href="/Checkout" passHref legacyBehavior>
              <Button variant="success" className="mt-3" disabled={cart.length === 0}>
                Checkout
              </Button>
            </Link>
          </Card.Body>
        </Card>

        {/* QR Generator Section */}
        <Card className="shadow-sm rounded-3 p-4 mb-5 w-100" style={{ maxWidth: "600px" }}>
          <Card.Title className="mb-3">Generate Product QR Code</Card.Title>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price (₹)</Form.Label>
              <Form.Control
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleGenerate}>
              Generate QR Code
            </Button>
          </Form>

          {generatedData && (
            <div className="text-center mt-4">
              <QRCodeCanvas id="qr-code-canvas" value={generatedData} size={256} />
              <p className="mt-2 text-muted">Encoded: {generatedData}</p>
              <Button
                variant="dark"
                onClick={() => {
                  const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
                  const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                  const downloadLink = document.createElement("a");
                  downloadLink.href = pngUrl;
                  downloadLink.download = `${productName}_QR.png`;
                  downloadLink.click();
                }}
              >
                Download QR
              </Button>
            </div>
          )}
        </Card>

        <footer className="text-center text-muted mt-5">
          © {new Date().getFullYear()} Vista-o-Matic: An advanced solution
        </footer>
      </Container>
    </div>
  );
};

export default QRScanner;
