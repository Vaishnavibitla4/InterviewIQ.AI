import React from 'react'
import Navbar from '../components/Navbar'
import { useSelector } from 'react-redux'
import { motion } from "motion/react";
import { HiSparkles } from 'react-icons/hi';
import AuthModel from '../components/AuthModel';
import { useState } from 'react';
import { BsRobot, BsMic, BsClock, BsBarChart, BsFileEarmarkText } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

function Home() {
  const {userData} = useSelector((state) => state.user)
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate()
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
            <div className='flex flex-wrap justify-center gap-4 mt-10'>
              <motion.button
              onClick={()=>{
                if(!userData){
                  setShowAuth(true)
                  return;
                }
                navigate("/interview")
              }}
              whileHover={{ opacity:0.9, scale:1.03}}
              whileTap={{opacity:1, scale:0.98}}
              className='bg-black text-white px-10 py-3 rounded-full hover:opacity-90 transition shafow-md'
              > Start Interview

              </motion.button>

              <motion.button
              onClick={()=>{
                if(!userData){
                  setShowAuth(true)
                  return;
                }
                navigate("/history")
              }}
              whileHover={{ opacity:0.9, scale:1.03}}
              whileTap={{opacity:1, scale:0.98}}
              className='border border-gray-300 px-10 py-3 rounded-full hover:bg-gray-100 transition'
              > View History

              </motion.button>
              
            </div>
          </div>
      </div>
      {showAuth && <AuthModel onClose={()=>setShowAuth(false)} />}
    </div>
  )
}

export default Home
