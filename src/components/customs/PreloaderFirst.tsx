"use client";
import { motion } from "framer-motion";

const FirstPreloader = () => {
  return (
    <motion.div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[#080811]/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div className="relative flex h-full w-full items-center justify-center">
        {/* Outer rotating gradient ring */}
        <motion.div
          className="absolute z-40"
          initial={{
            borderRadius: "0%",
            width: "100vw",
            height: "100vh",
            border: "4px solid transparent",
            background:
              "linear-gradient(45deg, #242436, #242440, #242436) border-box",
            WebkitMask:
              "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            opacity: 0,
          }}
          animate={{
            borderRadius: ["0%", "50%"],
            width: ["100vw", "calc(100vh + 16px)"],
            height: ["100vh", "calc(100vh + 16px)"],
            opacity: 1,
            rotate: 360,
          }}
          transition={{
            rotate: {
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            },
            opacity: { duration: 0.3 },
            borderRadius: { duration: 0.8, ease: "easeOut" },
          }}
        />

        {/* Middle rotating gradient ring */}
        <motion.div
          className="z-41 absolute"
          initial={{
            borderRadius: "0%",
            width: "100vw",
            height: "100vh",
            border: "3px solid transparent",
            background:
              "linear-gradient(-45deg, #242436, #242440, #242436) border-box",
            WebkitMask:
              "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            opacity: 0,
          }}
          animate={{
            borderRadius: ["0%", "50%"],
            width: ["100vw", "calc(100vh + 8px)"],
            height: ["100vh", "calc(100vh + 8px)"],
            opacity: 1,
            rotate: -360,
          }}
          transition={{
            rotate: {
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            },
            opacity: { duration: 0.3, delay: 0.1 },
            borderRadius: { duration: 1.5, ease: "easeOut" },
          }}
        />

        {/* Main circle */}
        <motion.div
          className="absolute z-50 flex items-center justify-center bg-[#080811]/95 backdrop-blur-sm"
          initial={{
            borderRadius: "0%",
            width: "100vw",
            height: "100vh",
            opacity: 0,
          }}
          animate={{
            borderRadius: ["0%", "50%"],
            width: ["100vw", "100vh"],
            height: ["100vh", "100vh"],
            opacity: 1,
            scale: [1, 1.01, 1],
          }}
          exit={{
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 0.8,
            scale: {
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            },
          }}
          style={{
            boxShadow: "0 0 30px rgba(138, 109, 255, 0.15)",
          }}
        >
          <motion.div className="flex flex-col items-center gap-4">
            <motion.h1
              className="whitespace-nowrap bg-gradient-to-r from-[#8456E8] from-[10%] via-[#E896FF] to-[#8456E8] to-[90%] bg-clip-text font-geistSemiBold text-6xl text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 0.5,
                delay: 0.4,
                backgroundPosition: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            >
              Welcome to Nova V2
            </motion.h1>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default FirstPreloader;
