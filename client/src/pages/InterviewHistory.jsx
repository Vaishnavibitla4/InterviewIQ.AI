import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ServerUrl } from '../App.jsx'
import { FaArrowLeft } from 'react-icons/fa'


function InterviewHistory() { 
    const [interviews, setInterviews] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const getMyInterviews = async () => {
            try{
                const result = await axios.get(ServerUrl + "/api/interview/get-interview", {withCredentials:true})
                console.log(result.data)
                setInterviews((result.data))
            } catch(error) {
                console.log(error)
            }
        }
        getMyInterviews()
    }, [])
  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 py-10'>
      <div className='w-[90vw] lg:w-[70vw] max-w-[90%] mx-auto'>
        <div className='mb-10 w-full flex items-start gap-4 flex-wrap'>
           <button
           onClick={() => navigate("/")}
           className='mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition'>
            <FaArrowLeft className='text-gray-600'></FaArrowLeft>
            </button> 
           <div>
            <h1 className='text-3xl font-bold flex-nowrap text-gray-800'>
                Interview History
            </h1>
            <p className='text-gray-500 mt-2'>
                Tarck your past interviews and performance reports
            </p>
           </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewHistory
