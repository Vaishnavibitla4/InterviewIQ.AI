import React from 'react'
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function Step3Report({report}) {
  if (!report) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-gray-500 text-lg'>
          loading Report...
        </p>
      </div>
    );
  }

  const navigate = useNavigate()

  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const questionScoreData = questionWiseScore.map((score,index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0
  }))

  const skills = [
    { label : "Confidence", value: confidence },
    { label : "Communication", value: communication},
    { label : "Correctness", value: correctness},
  ];
  let performaceText = "";
  let shortTagLine = "";

  if (finalScore >= 8) {
    performaceText = "Ready for job opportunities." ;
    shortTagLine = "Excellent clarity and structured responses.";

  }else if (finalScore >= 5) {
    performaceText = "Needs minor improvement before interviews.";
    shortTagLine = "Good foundation, refine articulation.";
  } else {
    performaceText = "Significant improvement required.";
    shortTagLine = "Work on Clarity and confidence.";
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-green-50 px-4 sm:px-6 lg:px-10 py-8'>
      <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='mb-10 w-full flex items-start gap-4 flex-wrap'>
                   <button
                   onClick={() => navigate("/history")}
                   className='mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition'>
                    <FaArrowLeft className='text-gray-600'></FaArrowLeft>
                    </button> 
                   <div>
                    <h1 className='text-3xl font-bold flex-nowrap text-gray-800'>
                        Interview Analytics Dashboard
                    </h1>
                    <p className='text-gray-500 mt-2'>
                        AI-powered performance insights
                    </p>
                   </div>
        </div>

        <button className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm;text-base'>
          Download PDF
        </button>
      </div>
    </div>
  )
}

export default Step3Report
