"use client";
import { FaLocationArrow } from "react-icons/fa6";
import MagicButton from "./ui/MagicButton";
import { Spotlight } from "./ui/Spotlight";
import { TypewriterEffect } from "./ui/TypewriterEffect";
import { SparklesCore } from "./ui/Sparkles"; // Import SparklesCore
import Image from 'next/image'; // Import Next.js Image component for optimization

const Hero = () => {
  const words = [
    {
      text: "Welcome",
    },
    {
      text: "to",
    },
    {
      text: "VISTA-o-Matic",
      className: "text-[#D97C29] dark:text-[#D97C29]", // Use the provided color for the name
    },
  ];

  return (
    <div id="home" className="pt-36 bg-[#00132a]">
      {/* Logo Section */}
      <div className="absolute top-5 left-5 z-20">
        <Image 
          src="/logo.png" // Update with your logo path
          alt="Logo"
          width={120} // Adjust the width as needed
          height={120} // Adjust the height as needed
        />
      </div>

      {/* Spotlight Effects */}
      <div>
        <Spotlight
          className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
          fill="white"
        />
        <Spotlight className="top-10 left-full h-[80vh]" fill="purple" />
        <Spotlight
          className="top-28 left-80 h-[80vh] w-[50vw]"
          fill="#87CEEB"
        />
        <Spotlight
          className="absolute -top-20 left-1/2 transform -translate-x-1/2 h-[40vh] w-[30vw]"
          fill="white"
        />
      </div>

      {/* Background Overlay */}
      <div className="h-screen w-full bg-[#00132a] flex items-center justify-center absolute top-0 left-0">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-[#00132a] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </div>

      {/* Main Content Section */}
      <div className="flex justify-center relative my-20 z-10">
        <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">
          {/* Spacing adjustment */}
          <div className="mb-10"></div> {/* Add extra margin space here */}

          <h1 className="uppercase tracking-widest text-[28px] text-center text-[#E4CFA1] max-w-80"> {/* Apply color here */}
            VISTA-o-Matic
          </h1>

          {/* Typewriter Effect */}
          <TypewriterEffect
            className="text-center md:text-5xl lg:text-6xl my-5 text-[#D97C29]" // Apply the color here
            words={words}
          />

          <div className="w-[40rem] h-40 relative">
            {/* Gradients */}
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-900 to-transparent h-[2px] w-3/4 blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-900 to-transparent h-px w-3/4" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-800 to-transparent h-[5px] w-1/4 blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-800 to-transparent h-px w-1/4" />

            {/* Core component */}
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={1200}
              className="w-full h-full"
              particleColor="#FFFFFF"
            />

            {/* Radial Gradient to prevent sharp edges */}
            <div className="absolute inset-0 w-full h-full bg-[#00132a] [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
          </div>

          {/* Description Text */}
          <p className="text-center md:tracking-wider mb-4 text-sm md:text-lg lg:text-2xl text-[#E4CFA1]"> {/* Apply the color here */}
            An advanced solution for real-time scanning, tracking, and space analysis using AI-powered computer vision.
          </p>

          {/* Call to Action Button */}
          <a href="#projects" className="cursor-pointer">
            <MagicButton
              title="Explore my Visionary Work"
              icon={<FaLocationArrow />}
              position="right"
              buttonColor="#236C4B" // Apply a color to the button
              hoverColor="#7E1F28" // Apply hover color
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
