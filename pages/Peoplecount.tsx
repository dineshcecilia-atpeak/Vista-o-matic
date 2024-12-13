'use client';

import { Container, Navbar, Button } from 'react-bootstrap';
import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { supabase } from "../lib/supabaseClient"; // Correct path to your supabaseClient
import { ArrowLeft } from 'react-bootstrap-icons'; // Imp


const PeopleCount: React.FC = () => {
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [peopleCount, setPeopleCount] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Function to send people count to Supabase
  const sendCountToDatabase = async (PeopleCount: number) => {
    try {
      // Set current timestamp and format date and time
      const currentTimestamp = new Date();
      const formattedDate = `${currentTimestamp.getFullYear()}-${String(currentTimestamp.getMonth() + 1).padStart(2, '0')}-${String(currentTimestamp.getDate()).padStart(2, '0')}`;
      const formattedTime = `${String(currentTimestamp.getHours()).padStart(2, '0')}:${String(currentTimestamp.getMinutes()).padStart(2, '0')}:${String(currentTimestamp.getSeconds()).padStart(2, '0')}`;

      const { error } = await supabase.from("peopledata").insert({
        "lastCount": PeopleCount,
        "timestamp": `${formattedDate} ${formattedTime}` // Combine date and time
      });

      setPeopleCount(0); // Reset current count
      console.log(error);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  // Timer to send data every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (peopleCount > 0) {
        sendCountToDatabase(peopleCount);
      }
    }, 6000); // 1 minute

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [peopleCount]);

  const handleStartCamera = async () => {
    setShowCamera(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }

    const model = await cocoSsd.load();
    detectPeople(model);
  };

  const handleStopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
    setPeopleCount(0);
  };

  const detectPeople = async (model: cocoSsd.ObjectDetection) => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas size to match video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const detect = async () => {
        if (video.readyState === 4 && context) {
          const predictions = await model.detect(video);
          const people = predictions.filter((p) => p.class === 'person');
          setPeopleCount(people.length);

          // Draw bounding boxes
          context.clearRect(0, 0, canvas.width, canvas.height);
          people.forEach((person) => {
            const [x, y, width, height] = person.bbox;

            // Ensure bounding boxes stay within canvas dimensions
            const boundedX = Math.max(0, x);
            const boundedY = Math.max(0, y);
            const boundedWidth = Math.min(canvas.width - boundedX, width);
            const boundedHeight = Math.min(canvas.height - boundedY, height);

            context.strokeStyle = '#da7c29'; // Changed to new color
            context.lineWidth = 2;
            context.strokeRect(boundedX, boundedY, boundedWidth, boundedHeight);
          });
        }
        requestAnimationFrame(detect);
      };
      detect();
    }
  };

  return (
    <>
      <Navbar className="w-100 py-2" style={{ backgroundColor: 'transparent' }}>
        <Button variant="link" className="text-dark" onClick={() => window.history.back()}>
          <ArrowLeft size={24} className="me-2" />
        </Button>
      </Navbar>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: '20px',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            width: '100%',
            fontSize: '64px', // Big and bold for prominence
            fontWeight: '700',
            color: '#2C3E50',
            letterSpacing: '2px',
            animation: 'fadeSlideIn 1s ease-in-out',
          }}
        >
          People Counting
        </h1>
        <style jsx>{`
          @keyframes fadeSlideIn {
            0% {
              opacity: 0;
              transform: translateY(-30px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        <br />
  
        <div
          style={{
            background: '#fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            width: '90%',
            maxWidth: '600px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 'auto',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              overflow: 'hidden',
              borderRadius: '16px',
            }}
          >
            {showCamera ? (
              <>
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '16px',
                  }}
                  autoPlay
                  muted
                />
                <canvas
                  ref={canvasRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                />
              </>
            ) : (
              <div
                style={{
                  height: '300px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '16px',
                  background: '#f9f9f9',
                  boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <p style={{ color: '#999' }}>Camera is off</p>
              </div>
            )}
          </div>
          <h2 style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#444' }}>
            Current Count: <span style={{ color: '#da7c29' }}>{peopleCount}</span>
          </h2>
          <div style={{ marginTop: '20px' }}>
            {showCamera ? (
              <Button variant="danger" onClick={handleStopCamera} style={{ padding: '10px 20px', fontSize: '1rem' }}>
                Stop Camera
              </Button>
            ) : (
              <Button variant="primary" onClick={handleStartCamera} style={{ padding: '10px 20px', fontSize: '1rem', backgroundColor:'#da7c29'}}>
                Start Camera
              </Button>
            )}
          </div>
        </div>
        
      </div>
    </>
  );
};

export default PeopleCount;
