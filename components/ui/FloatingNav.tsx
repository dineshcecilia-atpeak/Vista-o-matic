"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);

  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit backdrop-blur-md fixed top-10 inset-x-0 mx-auto border rounded-xl shadow-lg z-[5000] px-8 py-4 border-white/[0.2] items-center justify-center space-x-4",
          className
        )}
      >
        {navItems.map((navItem: any, idx: number) => (
          <div
            key={`link=${idx}`}
            className="relative group"
            onMouseEnter={() => {
              if (navItem.name === "Camera Interface") setHovered(true);
            }}
            onMouseLeave={() => {
              if (navItem.name === "Camera Interface") setHovered(false);
            }}
          >
            <Link
              href={navItem.link}
              className={cn(
                "relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-500"
              )}
            >
              <span className="block sm:hidden">{navItem.icon}</span>
              <span className="text-sm !cursor-pointer">{navItem.name}</span>
            </Link>

            {/* Dropdown for "Camera Interface" */}
            {navItem.name === "Camera Interface" && (
              <AnimatePresence>
                {hovered && (
                  <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[600px] bg-[#D97C29]/50 backdrop-blur-md shadow-xl rounded-lg p-4 border border-white/[0.2]"
                    initial={{ opacity: 1, y: 14, x: -200 }}
                    animate={{ opacity: 1, y: 30, x: -200 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      perspective: "1000px",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div className="flex justify-around items-center flex-wrap gap-4">
                      {/* Feedback */}
                      <Link href="/Feedback">
                        <div className="flex flex-col items-center group">
                          <img src="/attendance.png" alt="Feedback" className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                          <h3 className="mt-2 text-sm font-semibold text-white">Feedback</h3>
                        </div>
                      </Link>

                      {/* Air Monitor */}
                      <Link href="#Air">
                        <div className="flex flex-col items-center group">
                          <img src="/air.png" alt="Air" className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                          <h3 className="mt-2 text-sm font-semibold text-white">Air Monitor</h3>
                        </div>
                      </Link>

                      {/* Heatmap */}
                      <Link href="/StoreHeatmap">
                        <div className="flex flex-col items-center group">
                          <img src="/heatmap.png" alt="Heatmap" className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                          <h3 className="mt-2 text-sm font-semibold text-white">Heatmap</h3>
                        </div>
                      </Link>

                      {/* People Counting */}
                      <Link href="/Peoplecount">
                        <div className="flex flex-col items-center group">
                          <img src="/people.png" alt="Counting" className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                          <h3 className="mt-2 text-sm font-semibold text-white">Counting</h3>
                        </div>
                      </Link>

                      {/* QR Scanner */}
                      <Link href="/QRScanner">
                        <div className="flex flex-col items-center group">
                          <img src="/qr.png" alt="QR Scanner" className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                          <h3 className="mt-2 text-sm font-semibold text-white">QR Scanner</h3>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
