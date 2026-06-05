import { useEffect, useRef, useState } from 'react';
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer'
import { motion } from 'motion/react'
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import axios from "axios"
import  { ServerUrl } from "../App.jsx"
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';


function Step2Interview({interviewData, onFinish}) {

  const {interviewId, questions, userName} = interviewData;
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  // ✅ FIX 1: Mirror isMicOn in a ref so async callbacks always read the latest value
  const isMicOnRef = useRef(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");


  const videoRef = useRef(null);
  const currentQuestion = questions[currentIndex];

  useEffect(()=>{
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      //Try known female voices first
      const femaleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
        );
      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      //Try known male voices
      const maleVoice = 
        voices.find(v =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
        );

      if(maleVoice){
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  },[])

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;


  const speakText = (text) => {
    return new Promise((resolve) => {
      if(!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();

      const humanText = text
        // add natural pauses after commas and periods
        .replace(/,/g, ", ... ")
        .replace(/\./g, ". ... ");

        const utterance = new SpeechSynthesisUtterance(humanText);

        utterance.voice = selectedVoice;

        // human-like pacing
        utterance.rate = 0.92; //slightly slower than normal
        utterance.pitch = 1.05; //small warmth
        utterance.volume = 1;

        utterance.onstart = () => {
          setIsAIPlaying(true);
          stopMic()
          videoRef.current?.play();
        };

        utterance.onend = () => {
          videoRef.current?.pause();
          videoRef.current.currentTime = 0;
          setIsAIPlaying(false);

          // ✅ FIX 2: Read from ref instead of stale state closure
          if(isMicOnRef.current) {
            startMic();
          }

           setTimeout(() => {
              setSubtitle("");
              resolve();
            }, 300);
        };

       setSubtitle(text);

       window.speechSynthesis.speak(utterance);

    });
  };

  useEffect(() => {
    if(!selectedVoice){
      return;
    }
    const runIntro = async () => {
      if(isIntroPhase){
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        await speakText(
          `I'll ask you a few questions. Just answer naturally, and take your time. Let's begin.`
        );
        setIsIntroPhase(false)
      } else if(currentQuestion){
        await new Promise(r => setTimeout(r, 800));

        if(currentIndex == questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question);

        // ✅ FIX 3: Read from ref for consistency
        if (isMicOnRef.current) {
          startMic();
        }
      }
    }

    runIntro()
  }, [selectedVoice, isIntroPhase, currentIndex])

  useEffect(() => {
    if(isIntroPhase)return;
    if(!currentQuestion)return;
    
    const timer = setInterval(() => {
        setTimeLeft((prev) =>{
          if(prev <= 1){
            clearInterval(timer)
            return 0;
          }
          return prev - 1;
        })
    }, 1000);

    return ()=> clearInterval(timer)
  }, [isIntroPhase, currentIndex])

  useEffect(()=> {
    if(!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex]);

  // Tracks whether recognition is currently running to avoid double-start errors
  const isRecognizingRef = useRef(false);
  // Tracks whether we *want* the mic to keep running (so onend can auto-restart)
  const shouldListenRef = useRef(false);

  const buildRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    // Show interim (in-progress) results so the textarea fills as you speak
    recognition.interimResults = true;

    recognition.onstart = () => {
      isRecognizingRef.current = true;
    };

    recognition.onresult = (event) => {
      let interim = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      // Append confirmed words; show interim text inline
      if (finalTranscript) {
        setAnswer((prev) => {
          const trimmed = prev.trimEnd();
          return trimmed ? trimmed + " " + finalTranscript : finalTranscript;
        });
        setInterimTranscript("");
      } else if (interim) {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event) => {
      // "no-speech" is benign — auto-restart below handles it
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        console.error("Microphone permission denied:", event.error);
        setIsMicOn(false);
        isMicOnRef.current = false; // ✅ FIX 4: Keep ref in sync on permission denial
        shouldListenRef.current = false;
      }
      isRecognizingRef.current = false;
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setInterimTranscript("");
      // Auto-restart if we still want the mic on
      // (browsers stop recognition after a few seconds of silence)
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch {
          // Already restarting — ignore
        }
      }
    };

    return recognition;
  };

  useEffect(() => {
    const rec = buildRecognition();
    if (!rec) {
      console.warn("SpeechRecognition not supported in this browser.");
    }
    recognitionRef.current = rec;

    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startMic = () => {
    if (!recognitionRef.current || isAIPlaying) return;
    shouldListenRef.current = true;
    if (!isRecognizingRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Already started — safe to ignore
      }
    }
  };

  const stopMic = () => {
    shouldListenRef.current = false;
    setInterimTranscript("");
    if (recognitionRef.current && isRecognizingRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  const toggleMic = () => {
    const next = !isMicOn;
    isMicOnRef.current = next; // ✅ FIX 5: Update ref before calling startMic/stopMic
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(next);
  };

  const submitAnswer = async () => {
    if(isSubmitting) return;
    stopMic()
    setIsSubmitting(true)
    try{
      const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId, 
        questionIndex: currentIndex,
        answer,
        timeTaken:
          currentQuestion.timeLimit - timeLeft,
      }, {withCredentials:true})

      setFeedback(result.data.feedback)
      speakText(result.data.feedback)
      setIsSubmitting(false)
    } catch(error) {
      console.log(error)
      setIsSubmitting(false)
    }
  }

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");
    if(currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if(isMicOnRef.current) startMic(); // ✅ FIX 6: Use ref here too
    }, 500);
  }

  const finishInterview = async (params) => {
    stopMic()
    setIsMicOn(false)
    isMicOnRef.current = false; // ✅ Keep ref in sync
    try{
      const result = await axios.post(ServerUrl + "/api/interview/finish", {interviewId}, {withCredentials:true})
      console.log(result.data)
      onFinish(result.data)
    } catch(error) {
      console.log(error)
    }
  }
  
  useEffect(() => {
    if(isIntroPhase) return;
    if(!currentQuestion) return;
    if(timeLeft === 0 && !isSubmitting && !feedback){
      submitAnswer();
    }
  }, [timeLeft]);

  useEffect(() =>{
    return () => {
      shouldListenRef.current = false;
      if(recognitionRef.current){
        try { recognitionRef.current.abort(); } catch {}
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className='min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6'>
      <div className='w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden'>
        {/* video section */}
        <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>
            <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-xl'>
              <video src={videoSource}
                key = {videoSource}
                ref = {videoRef}
                muted playsInline preload='auto' className='w-full h-auto object-cover'
              ></video>
            </div>

            {/* subtitle */}

            {subtitle && (
              <div className='w-full max-w-md bg-gray-50 border border-gray-20 rounded-xl p-4 shadow-sm'>
                  <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>
                    {subtitle}
                  </p>
              </div>

            )}

            {/* timer area */}
            <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5' >
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-500'>
                  Interview Status
                </span>
                { isAIPlaying && <span className='text-sm font-semibold text-emerald-600' >
                  { isAIPlaying ? "AI Speaking" : ""}
                </span> }
              </div>
              <div className='h-px bg-gray-200'>

              </div>
              <div className='flex justify-center'>
                  <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit}></Timer>
              </div>

              <div className='h-px bg-gray-200'></div>
              <div className='grid grid-cols-2 gap-6 text-center'>
                <div>
                  <span className='text-2xl font-bold text-emerald-600'>{currentIndex + 1}</span>
                  <span className='text-xs text-gray-400'>Current Questions</span>
                </div>
                <div>
                  <span className='text-2xl font-bold text-emerald-600'>{questions.length}</span>
                  <span className='text-xs text-gray-400'>Total Questions</span>
                </div>
              </div>
            </div>
        </div>

        {/* Text Section */}
        <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative'>
          <h2 className='text-xl sm:text-2xl font-bold text-emerald-600 mb-6'>AI Smart Interview</h2>
          { !isIntroPhase && (<div className='relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm'>
            <p className='text-xs sm:text-sm text-gray-400 mb-2'>
              Question {currentIndex + 1} of {questions.length}
            </p>
            <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed pr-16'>
              {currentQuestion?.question}
            </div>
            
          </div>)}
          {/* Answer textarea — shows confirmed text + live interim preview */}
          <div className='flex-1 relative'>
            <textarea 
              placeholder='Your spoken answer will appear here automatically. You can also type directly...'
              onChange={(e) => {
                // When user types manually, strip any interim suffix and store clean value
                const cleaned = e.target.value.endsWith(interimTranscript)
                  ? e.target.value.slice(0, e.target.value.length - interimTranscript.length).trimEnd()
                  : e.target.value;
                setAnswer(cleaned);
              }}
              value={answer + (interimTranscript ? (answer ? " " : "") + interimTranscript : "")}
              className='w-full h-full bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800 min-h-[160px]'>
            </textarea>
            {/* Live listening indicator */}
            {isMicOn && !isAIPlaying && (
              <div className='absolute bottom-3 right-3 flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full pointer-events-none'>
                <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></span>
                Listening…
              </div>
            )}
          </div>
          { !feedback ? (<div className='flex flex-center gap-4 mt-6'>
            <motion.button
            onClick={toggleMic}
            whileTap={{ scale:0.9 }}
            title={isMicOn ? "Mute microphone" : "Unmute microphone"}
            className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full shadow-lg transition-colors ${isMicOn ? 'bg-emerald-600 text-white ring-2 ring-emerald-300' : 'bg-gray-700 text-white'}`}
            >
              { isMicOn ? <FaMicrophone size={20}></FaMicrophone> : <FaMicrophoneSlash size={20}></FaMicrophoneSlash> }
            </motion.button>
            <motion.button 
            onClick={submitAnswer}
            disabled={isSubmitting}
            whileTap={{scale:0.95}}
            className='flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500'>
              {isSubmitting ? "Submitting..." : "Submit Answer" }
            </motion.button>
          </div>): (
            <motion.div 
            initial={{opacity: 0}}
            animate={{opacity: 1}}

            className='mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm'>
            <p className='text-emerald-700 font-medium mb-4'>{feedback}</p>
            <button 
            onClick={handleNext}
            className='w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1'>
              Next Question<BsArrowRight size={18}></BsArrowRight>
            </button>
            </motion.div>
          )}
        </div>

      </div>
      
    </div>
  )
}

export default Step2Interview


// work flow-
// mount -> Load voice -> Intro Speak -> Question Speak ->  Mic ON -> Timer Running -> Submit ->  Feedback Speak ->  Next Question ->  Repeat -> Finish
