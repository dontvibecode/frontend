"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function Button({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-full drop-shadow-customShadow bg-white text-sm font-medium text-gray-700 relative overflow-hidden"
    >
      {/* Animated circular fill overlay */}
      <motion.div
        className="absolute"
        initial={{ width: 0, height: 0, opacity: 0.4 }}
        animate={{
          width: isHovered ? "800px" : "0px",
          height: isHovered ? "800px" : "0px",
          opacity: isHovered ? 1 : 0.4,
        }}
        transition={{
          duration: isHovered ? 0.7 : 0.3,
          ease: isHovered ? "easeOut" : "easeOut"
        }}
        style={{
          background: "#000",
          borderRadius: "50%",
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: "translate(-50%, -50%)",
          zIndex: 1,
          filter: "none",
        }}
      />
      
      {/* Content with z-index to stay above the overlay */}
      <div className="relative z-10 flex items-center justify-center w-full">
        <motion.svg 
          className="w-5 h-5 mr-3" 
          viewBox="0 0 24 24"
          animate={{
            filter: isHovered ? "brightness(0) invert(1)" : "brightness(1) invert(0)"
          }}
          transition={{ duration: 0.3 }}
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </motion.svg>
        <motion.span
          animate={{
            color: isHovered ? "white" : "rgb(55, 65, 81)"
          }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.span>
      </div>
    </motion.button>
  );
}

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'google') {
      try {
        const result = await signIn('google', {
          callbackUrl: '/',
          redirect: false,
        });
        
        if (result?.error) {
          console.error('Sign in error:', result.error);
        } else if (result?.ok) {
          router.push('/');
        }
      } catch (error) {
        console.error('Authentication error:', error);
      }
    } else {
      console.log(`Login with ${provider} - Not implemented yet`);
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="w-screen h-screen overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      <div className="relative w-screen h-screen flex-1 flex flex-col lg:ml-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
            aria-hidden="true"
            ref={(video) => {
              if (video) {
                video.style.transition = "filter 1s ease-in-out";
                video.playbackRate = 0.2;
              }
            }}
          >
            <source src="/videos/loading.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="h-screen m-4 flex-1 flex flex-col bg-white/20 backdrop-blur-xs border border-black/10 shadow-[inset_0_0px_40px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden">
            <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-4 lg:p-8 main-scroll">
              <motion.div 
                className="text-center mb-8"
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{
                   duration: 0.4,
                   ease: "easeOut"
                 }}
              >
                <div className="mb-6">
                  <img
                    src="https://i.imgur.com/3Oiecme.png"
                    alt="dontvibecode logo"
                    width={400}
                    height={120}
                    className="mx-auto max-w-full h-auto"
                  />
                </div>
                
                <p className="text-base lg:text-lg text-black font-regular px-4">
                  Code like it matters. Think deeper. Build better. No AI crutches.
                </p>
              </motion.div>
              <motion.div 
                 className="sm:mx-auto sm:w-full sm:max-w-md"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut"
                  }}
               >
                 <div className="bg-white py-8 px-4 drop-shadow-customShadow border border-gray-200 rounded-2xl sm:px-10">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-lg">
                        <span className="px-3 bg-white text-black font-semibold tracking-wide">
                        Log in or sign up
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <Button onClick={() => handleSocialLogin('google')}>
                        Continue with Google
                      </Button>

                      {/* <button
                        onClick={() => handleSocialLogin('microsoft')}
                        className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                          <path fill="#f25022" d="M1 1h10v10H1z"/>
                          <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                          <path fill="#7fba00" d="M1 13h10v10H1z"/>
                          <path fill="#ffb900" d="M13 13h10v10H13z"/>
                        </svg>
                        Continue with Microsoft Account
                      </button>

                      <button
                        onClick={() => handleSocialLogin('apple')}
                        className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                        Continue with Apple
                      </button>

                      <button
                        onClick={() => handleSocialLogin('phone')}
                        className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Continue with phone
                      </button> */}
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <div className="text-sm text-gray-600 space-x-4">
                      <Link href="/terms" className="underline hover:text-gray-900 transition-colors duration-200">
                        Terms of Use
                      </Link>
                      <span>|</span>
                      <Link href="/privacy" className="underline hover:text-gray-900 transition-colors duration-200">
                        Privacy Policy
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      {/* <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ChatGPT</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Log in or sign up</h2>
          <p className="text-gray-600 text-base">
            You'll get smarter responses and can upload files, images, and more.
          </p>
        </div>
      </div> */}

    </div>
  );
}
