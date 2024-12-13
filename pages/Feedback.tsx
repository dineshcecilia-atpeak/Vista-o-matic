"use client";

import React, { useState, useRef } from 'react';
import { Card, Button, Container, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as faceapi from '@vladmandic/face-api';
import { supabase } from "../lib/supabaseClient"; // Correct path to your supabaseClient
import { ArrowLeft } from 'react-bootstrap-icons'; // Importing Bootstrap icons
interface CollectedData {
  gender: string;
  emotion: string;
  timestamp: string;
}

const Feedback: React.FC = () => {
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [maleCount, setMaleCount] = useState<number>(0);
  const [femaleCount, setFemaleCount] = useState<number>(0);
  const [finalMaleCount, setFinalMaleCount] = useState<number>(0);
  const [finalFemaleCount, setFinalFemaleCount] = useState<number>(0);
  const [mood, setMood] = useState<string>('Neutral');
  const [finalMood, setFinalMood] = useState<string>('UNKNOWN');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isPersonDetected, setIsPersonDetected] = useState<boolean>(false);
  const [collectedData, setCollectedData] = useState<CollectedData[]>([]);
  const [summaryVisible, setSummaryVisible] = useState<boolean>(false); // Track if summary is visible

  const handleStartCamera = async (): Promise<void> => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      mediaStreamRef.current = stream;
      videoRef.current!.srcObject = stream;

      videoRef.current!.onloadedmetadata = async () => {
        videoRef.current!.play();
        canvasRef.current!.width = videoRef.current!.videoWidth;
        canvasRef.current!.height = videoRef.current!.videoHeight;

        try {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.ageGenderNet.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models'),
          ]);
          detectFaces();
        } catch (error) {
          console.error('Error loading models:', error);
        }
      };

      // Reset summary when starting the camera
      setSummaryVisible(false);
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  };

  const handleStopCamera = async (): Promise<void> => {
    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
    setIsPersonDetected(false);

    // Save final counts and mood before stopping
    const totalMale = maleCount;
    const totalFemale = femaleCount;

    console.log(`Stopping camera: Total Male: ${totalMale}, Total Female: ${totalFemale}, Mood: ${mood}`);

    // Send collected data to Supabase
    if (collectedData.length > 0) {
      await saveDataToSupabase(totalMale, totalFemale);
    }

    // Update the final counts and mood
    setFinalMaleCount(totalMale);
    setFinalFemaleCount(totalFemale);
    setFinalMood(mood);
    setSummaryVisible(true); // Show the summary after stopping the camera
  };

  const detectFaces = async (): Promise<void> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const detect = async () => {
      if (video && canvas && video.videoWidth > 0 && video.videoHeight > 0) {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withAgeAndGender()
          .withFaceExpressions();

        drawBoxes(canvas.getContext('2d')!, video, detections);
      }
      requestAnimationFrame(detect);
    };

    detect();
  };

  const drawBoxes = (context: CanvasRenderingContext2D, video: HTMLVideoElement, detections: faceapi.Detection[]) => {
    if (!context || !canvasRef.current) return;

    context.clearRect(0, 0, video.videoWidth, video.videoHeight);
    context.strokeStyle = 'red';
    context.lineWidth = 2;

    const scaleX = canvasRef.current.width / video.videoWidth;
    const scaleY = canvasRef.current.height / video.videoHeight;

    let maleCountThisFrame = 0;
    let femaleCountThisFrame = 0;
    let detectedThisFrame = false;
    let newMood = 'UNKNOWN';

    detections.forEach(detection => {
      const { x, y, width, height } = detection.detection.box;
      context.strokeRect(x * scaleX, y * scaleY, width * scaleX, height * scaleY);

      const gender = detection.gender === 'male' ? 'MALE' : 'FEMALE';
      const expressions = detection.expressions;

      if (expressions) {
        newMood = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b
        ).toUpperCase();
      }

      detectedThisFrame = true;
      setIsPersonDetected(true); // Update the detection state

      // Count male and female faces
      if (gender === 'MALE') {
        maleCountThisFrame++;
      } else if (gender === 'FEMALE') {
        femaleCountThisFrame++;
      }

      // Collect data
      setCollectedData(prevData => [
        ...prevData,
        {
          gender: gender,
          emotion: newMood,
          timestamp: new Date().toISOString(),
        },
      ]);

      const boxWidth = 250;
      const boxHeight = 100;
      const boxX = x * scaleX + width * scaleX + 10;
      const boxY = y * scaleY;

      context.fillStyle = 'rgba(255, 255, 255, 0.7)';
      context.fillRect(boxX, boxY, boxWidth, boxHeight);

      context.fillStyle = 'black';
      context.font = '16px Arial';
      context.fillText(`GENDER: ${gender}`, boxX + 5, boxY + 40);
      context.fillText(`EMOTION: ${newMood}`, boxX + 5, boxY + 60);
    });

    setMaleCount(maleCountThisFrame);
    setFemaleCount(femaleCountThisFrame);
    setMood(newMood);

    if (!detectedThisFrame) {
      if (isPersonDetected) {
        setIsPersonDetected(false);
        setMood('UNKNOWN');
      }
    }
  };

  const saveDataToSupabase = async (totalMale: number, totalFemale: number): Promise<void> => {
    const currentDate = new Date();
    
    // Use Intl.DateTimeFormat for better control over date formatting
    const date = currentDate.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
    const time = currentDate.toLocaleTimeString('en-GB', { hour12: false }); // Format as HH:MM:SS
  
    try {
      const { data, error } = await supabase.from('analysis').insert([
        {
          Date: date,
          "Total male": totalMale,
          "Total Female": totalFemale,
          Time: time,
        },
      ]);
  
      if (error) {
        console.error('Error inserting data into Supabase:', error.message);
      } else {
        console.log('Data inserted successfully:', data);
      }
    } catch (error) {
      console.error('Error saving data to Supabase:', error);
    }
  };
  
  return (
    <Container fluid className="camera-container d-flex flex-column align-items-center justify-content-between" style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
    <Navbar className="w-100 py-2" style={{ backgroundColor: 'transparent' }}>
      <Button variant="link" className="text-dark" onClick={() => window.history.back()}>
        <ArrowLeft size={24} className="me-2" />
      </Button>
    </Navbar>
    <h2 className="m-0" style={{
  textAlign: 'center',
  width: '100%',
  fontSize: '64px',          /* Make it big and bold */
  fontWeight: '700',         /* Bold for prominence */
  color: '#2C3E50',          /* A modern dark blue-gray */
  letterSpacing: '2px',      /* Slight spacing for elegance */
  animation: 'fadeSlideIn 1s ease-in-out' /* Smooth, elegant animation */
}}>
  Feedback
</h2>

<style jsx>{`
  @keyframes fadeSlideIn {
    0% {
      opacity: 0;
      transform: translateY(-30px); /* Slight upward slide */
    }
    100% {
      opacity: 1;
      transform: translateY(0); /* Settle into position */
    }
  }
`}</style>

      <Card className="shadow" style={{ width: '100%', maxWidth: '600px' }}>
        <Card.Body>
          
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
              <p style={{ color: '#999', fontSize: '16px', textAlign: 'center' }}>
                Click "Start Camera" to enable the webcam.
              </p>
            </div>
          )}
        </Card.Body>
        <Card.Footer className="d-flex justify-content-center">
          {showCamera ? (
            <Button variant="secondary" onClick={handleStopCamera} >
              Stop Camera
            </Button>
          ) : (
               <Button variant="primary" onClick={handleStartCamera} style={{ backgroundColor: '#da7c29' }}>
                Start Camera
            </Button>
          )}
        </Card.Footer>
      </Card>

      {summaryVisible && (
        <Card className="mt-4 shadow" style={{ width: '100%', maxWidth: '600px' }}>
          <Card.Body>
            <h5 className="card-title">Analysis Summary</h5>
            <p>Total Males: {finalMaleCount}</p>
            <p>Total Females: {finalFemaleCount}</p>
            <p>Mood: {finalMood}</p>
          </Card.Body>
        </Card>
      )}

      <footer className="bg-light w-100 text-center py-3">
        <p className="mb-0">
          © {new Date().getFullYear()} Vista-o-Matic: <span role="img" aria-label="heart"></span>  An advanced solution 
        </p>
      </footer>
    </Container>
  );
};

export default Feedback;