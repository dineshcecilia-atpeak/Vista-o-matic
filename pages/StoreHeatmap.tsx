"use client";

import React, { useRef, useState } from 'react';
import { Navbar } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons'; // Importing Bootstrap icons

import { Button, Card, CardContent, Typography, Container, Box } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';

const StoreHeatmap: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heatmapRef = useRef<HTMLCanvasElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const HEATMAP_WIDTH = 500;
  const HEATMAP_HEIGHT = 400;
  const FRAME_INTERVAL = 10;
  const HEATMAP_SCALE = 10;

  // Heatmap data storage
  const heatmapData: number[][] = Array(HEATMAP_WIDTH / HEATMAP_SCALE)
    .fill(0)
    .map(() => Array(HEATMAP_HEIGHT / HEATMAP_SCALE).fill(0));

  // Handle video file upload
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setVideoSrc(videoUrl);
      stopProcessing(); // Stop any ongoing camera feed if a video is uploaded
    }
  };

   // Start camera feed
const startCamera = async () => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    setStream(mediaStream);
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;

      // Wait for the video to load metadata before playing
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
      };
    }
    setVideoSrc(null); // Disable video source if camera is used
  } catch (err) {
    console.error('Error accessing camera:', err);
  }
};

  // Start video processing
  const startProcessing = () => {
    setIsProcessing(true);
    processVideo();
  };

  // Stop video processing and reset heatmap
  const stopProcessing = () => {
    setIsProcessing(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    resetHeatmap(); // Reset heatmap when processing stops
  };

  // Reset heatmap data and rendering
  const resetHeatmap = () => {
    // Reset heatmap data
    for (let x = 0; x < heatmapData.length; x++) {
      for (let y = 0; y < heatmapData[x].length; y++) {
        heatmapData[x][y] = 0;
      }
    }

    // Clear heatmap canvas
    const heatmapCanvas = heatmapRef.current;
    const heatmapCtx = heatmapCanvas?.getContext('2d');
    if (heatmapCtx) {
      heatmapCtx.clearRect(0, 0, HEATMAP_WIDTH, HEATMAP_HEIGHT);
    }
  };

  // Process video frame-by-frame
  const processVideo = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const heatmapCanvas = heatmapRef.current;

    if (!canvas || !heatmapCanvas || !video) {
      console.error('Canvas or video element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    const heatmapCtx = heatmapCanvas.getContext('2d');
    let frameCount = 0;

    const processFrame = () => {
      if (!isProcessing || video.paused || video.ended) return;

      ctx?.drawImage(video, 0, 0, HEATMAP_WIDTH, HEATMAP_HEIGHT);
      const frameData = ctx?.getImageData(0, 0, HEATMAP_WIDTH, HEATMAP_HEIGHT);

      if (frameData && frameCount % FRAME_INTERVAL === 0) {
        detectMovement(frameData);
        renderHeatmap(heatmapCtx);
      }

      frameCount++;
      requestAnimationFrame(processFrame);
    };

    video.play();
    requestAnimationFrame(processFrame);
  };

  // Detect movement based on brightness
  const detectMovement = (frameData: ImageData) => {
    const pixels = frameData.data;
    for (let y = 0; y < HEATMAP_HEIGHT; y += HEATMAP_SCALE) {
      for (let x = 0; x < HEATMAP_WIDTH; x += HEATMAP_SCALE) {
        const pixelIndex = (y * HEATMAP_WIDTH + x) * 4;
        const red = pixels[pixelIndex];
        const green = pixels[pixelIndex + 1];
        const blue = pixels[pixelIndex + 2];

        const brightness = (red + green + blue) / 3;

        // Increase heatmap intensity for lower brightness (i.e., more movement)
        if (brightness < 100) {
          const heatX = Math.floor(x / HEATMAP_SCALE);
          const heatY = Math.floor(y / HEATMAP_SCALE);
          heatmapData[heatX][heatY]++;
        }
      }
    }
  };

  // Render heatmap with color based on intensity
  const renderHeatmap = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, HEATMAP_WIDTH, HEATMAP_HEIGHT);
    for (let x = 0; x < heatmapData.length; x++) {
      for (let y = 0; y < heatmapData[x].length; y++) {
        const intensity = heatmapData[x][y];
        let color = 'green'; // Default: no population

        if (intensity > 30) {
          color = 'red'; // High population
        } else if (intensity > 10) {
          color = 'yellow'; // Medium population
        }

        ctx.fillStyle = color;
        ctx.fillRect(x * HEATMAP_SCALE, y * HEATMAP_SCALE, HEATMAP_SCALE, HEATMAP_SCALE);
      }
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '50px' }}>
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
  Store Heatmap
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
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
         

          <Box display="flex" justifyContent="center" marginBottom={3}>
            <Button
              variant="contained"
              component="label"
              color="primary"
              style={{ marginRight: '10px', backgroundColor:'#da7c29' , borderBlockColor:'#da7c29'}}
            >
              Upload Video
              <input type="file" accept="video/*" hidden onChange={handleVideoUpload} />
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={startProcessing}
              disabled={!videoSrc && !stream}
              style={{ marginRight: '10px' }}
            >
              Start Video
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={stopProcessing}
              disabled={!isProcessing}
              style={{ marginRight: '10px' }}
            >
              Stop
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={startCamera}
              disabled={isProcessing}
              style={{ marginRight: '10px' , backgroundColor:'#246b4c' , borderBlockColor:'#246b4c'}}
            >
              Start Camera
            </Button>
          </Box>

          <Box display="flex" justifyContent="center">
            {videoSrc && (
              <video ref={videoRef} src={videoSrc} width={HEATMAP_WIDTH} height={HEATMAP_HEIGHT} controls muted />
            )}
            {stream && (
              <video ref={videoRef} width={HEATMAP_WIDTH} height={HEATMAP_HEIGHT} autoPlay muted />
            )}
          </Box>

          <Box marginTop={3}>
            <Typography variant="h5" align="center">Heatmap</Typography>
            <Box display="flex" justifyContent="center">
              <canvas ref={canvasRef} width={HEATMAP_WIDTH} height={HEATMAP_HEIGHT} style={{ display: 'none' }}></canvas>
              <canvas ref={heatmapRef} width={HEATMAP_WIDTH} height={HEATMAP_HEIGHT}></canvas>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <footer className="bg-white w-100 text-center py-3">
  <p className="mb-0">
    © {new Date().getFullYear()} Vista-o-Matic: <span role="img" aria-label="heart"></span> An advanced solution
  </p>
</footer>

    </Container>
  );
};

export default StoreHeatmap;
