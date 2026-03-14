import React from 'react'
import Navbar from '../components/Navbar'
import { useSelector } from 'react-redux'
import { motion } from "motion/react";
import { HiSparkles } from 'react-icons/hi';

function Home() {
  const {userData} = useSelector((state) => state.user)
  return (
    <div className='min-h-screen bg-[#f3f3f3] flex flex-col' >
      <Navbar />
      <div className='flex-1 px-6 py-20'>
        <div className='flex justify-center mb-6'>
          <div className='bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full flex items-center gap-2'>
            <HiSparkles size={16} className='bg-green-50 text-green-600'/>
            AI Powered Smart Interview Platform
          </div>
        </div>
        <div className='text-center mb-28'>
            <motion.h1 
            initial={{ opacity: 0, y : 30}}
            animate={{ opacity: 1, y: 0}}
            transition={{duration:0.6}}
            className = 'text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto'>
              Practice Interviews with
              <span className='relative inline-block'>
                <span className='bg-green-100 text-green-600 px-5 py-1'>
                  AI Intelligence
                </span>
              </span>
            </motion.h1>
            <motion.p 
            initial={{ opacity: 0}}
            animate={{ opacity: 1}}
            transition={{duration: 0.8}}
            className='text-gray-500 mt-6 max-w-2xl mx-auto text-lg'
            >
              Role based mock interviews with smart follow-ups, adaptive difficulty and real-time performance evaluation.
            </motion.p>
            <div>
              
            </div>
          </div>
      </div>
    </div>
  )
}

export default Home
