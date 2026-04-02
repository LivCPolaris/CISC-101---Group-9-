import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Phone, 
  Video, 
  AlertCircle, 
  ChevronRight, 
  MessageCircle, 
  Bell,
  Heart,
  User,
  X
} from 'lucide-react';
import { QUESTIONS, THERAPISTS, Therapist } from './constants';
import { categorizeResponse, getEmpathicResponse, Category } from './lib/gemini';

type AppStep = 'welcome' | 'questionnaire' | 'results' | 'therapist-chat';

interface Message {
  id: string;
  text: string;
  sender: 'harper' | 'user' | 'therapist';
  timestamp: Date;
}

export default function App() {
  const [step, setStep] = useState<AppStep>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [tallies, setTallies] = useState<Record<Category, number>>({
    Anxiety: 0,
    Depression: 0,
    ADHD: 0,
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [matchedTherapist, setMatchedTherapist] = useState<Therapist | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [notificationsAllowed, setNotificationsAllowed] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessage = (text: string, sender: 'harper' | 'user' | 'therapist') => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const startQuestionnaire = () => {
    setStep('questionnaire');
    addMessage("Hello, I'm Harper. I'm here to listen and help you find the right support. Shall we begin with a few questions about how you've been feeling?", 'harper');
  };

  const handleAnswer = async (answerText: string, category?: Category) => {
    if (!answerText.trim()) return;

    addMessage(answerText, 'user');
    setInputText('');
    setIsTyping(true);

    let finalCategory = category;
    if (!finalCategory) {
      finalCategory = await categorizeResponse(QUESTIONS[currentQuestionIndex].text, answerText);
    }

    setTallies(prev => ({
      ...prev,
      [finalCategory!]: prev[finalCategory!] + 1
    }));

    const empathicResponse = await getEmpathicResponse(answerText);
    addMessage(empathicResponse, 'harper');
    setIsTyping(false);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setTimeout(() => processResults(), 1500);
    }
  };

  const processResults = () => {
    const sorted = Object.entries(tallies).sort((a, b) => b[1] - a[1]);
    const topScore = sorted[0][1];
    const topCategories = sorted.filter(s => s[1] === topScore).map(s => s[0] as Category);

    let therapist: Therapist | null = null;

    if (topCategories.length === 1) {
      therapist = THERAPISTS.find(t => t.specialties.length === 1 && t.specialties[0] === topCategories[0]) || THERAPISTS[0];
    } else {
      // Find a therapist that matches at least two of the top categories
      therapist = THERAPISTS.find(t => 
        t.specialties.every(s => topCategories.includes(s)) && t.specialties.length === topCategories.length
      ) || THERAPISTS.find(t => t.specialties.some(s => topCategories.includes(s))) || THERAPISTS[0];
    }

    setMatchedTherapist(therapist);
    setStep('results');
  };

  const goToChat = () => {
    setStep('therapist-chat');
    setMessages([]); // Clear Harper chat for therapist chat
    addMessage(`Hello, I'm ${matchedTherapist?.name}. I've received your assessment results. I'm currently offline, but I'll be back soon to talk with you.`, 'therapist');
  };

  const requestNotifications = () => {
    setNotificationsAllowed(true);
    alert("Notifications enabled. We'll let you know when your therapist is back online.");
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#4A4A4A] font-sans selection:bg-[#E8F3F1] relative overflow-hidden">
      {/* Jasmine Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c2 0 5 3 5 7s-3 7-5 7-5-3-5-7 3-7 5-7zm15 15c2 0 5 3 5 7s-3 7-5 7-5-3-5-7 3-7 5-7zM15 20c2 0 5 3 5 7s-3 7-5 7-5-3-5-7 3-7 5-7zm15 15c2 0 5 3 5 7s-3 7-5 7-5-3-5-7 3-7 5-7zm15 15c2 0 5 3 5 7s-3 7-5 7-5-3-5-7 3-7 5-7zM15 50c2 0 5 3 5 7s-3 7-5 7-5-3-5-7 3-7 5-7z' fill='%232D5A54' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundSize: '120px 120px'
      }} />

      <main className="relative z-10 max-w-2xl mx-auto h-screen flex flex-col p-6">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="w-24 h-24 bg-[#E8F3F1] rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 text-[#8AB6B0]" />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-light tracking-tight text-[#2D5A54]">Harper</h1>
                <p className="text-lg text-[#7A7A7A] max-w-md leading-relaxed">
                  A private, comforting space to understand your mind and find the support you deserve.
                </p>
              </div>
              <button 
                onClick={startQuestionnaire}
                className="px-8 py-3 bg-[#2D5A54] text-white rounded-full hover:bg-[#244943] transition-colors duration-300 flex items-center gap-2 group"
              >
                Begin Journey
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {(step === 'questionnaire' || step === 'therapist-chat') && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col h-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between py-4 border-b border-[#F0F0F0] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E8F3F1] rounded-full flex items-center justify-center">
                    {step === 'questionnaire' ? <Heart className="w-5 h-5 text-[#8AB6B0]" /> : <User className="w-5 h-5 text-[#8AB6B0]" />}
                  </div>
                  <div>
                    <h2 className="font-medium text-[#2D5A54]">{step === 'questionnaire' ? 'Harper' : matchedTherapist?.name}</h2>
                    <p className="text-xs text-[#9A9A9A]">{step === 'questionnaire' ? 'AI Companion' : 'Therapist • Offline'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {step === 'therapist-chat' && (
                    <>
                      <button className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors text-[#8AB6B0]"><Phone className="w-5 h-5" /></button>
                      <button className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors text-[#8AB6B0]"><Video className="w-5 h-5" /></button>
                    </>
                  )}
                  <button 
                    onClick={() => setShowEmergency(true)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-400"
                  >
                    <AlertCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-6 pb-4 scrollbar-hide">
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-[#2D5A54] text-white rounded-tr-none' 
                        : 'bg-[#F5F5F5] text-[#4A4A4A] rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#F5F5F5] px-5 py-3 rounded-2xl rounded-tl-none flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#9A9A9A] rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[#9A9A9A] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-[#9A9A9A] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                
                {/* Options for Questionnaire */}
                {step === 'questionnaire' && !isTyping && messages.length > 0 && messages[messages.length-1].sender === 'harper' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2 pt-2"
                  >
                    <p className="text-xs text-[#9A9A9A] px-2 mb-3">Choose an option or describe how you feel below:</p>
                    {QUESTIONS[currentQuestionIndex].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(opt.text, opt.category)}
                        className="w-full text-left px-5 py-3 rounded-xl border border-[#E0E0E0] hover:border-[#2D5A54] hover:bg-[#FDFCFB] transition-all text-sm text-[#6A6A6A] hover:text-[#2D5A54]"
                      >
                        {opt.text}
                      </button>
                    ))}
                  </motion.div>
                )}

                {step === 'therapist-chat' && !notificationsAllowed && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-[#E8F3F1] rounded-2xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-[#2D5A54]" />
                      <p className="text-xs text-[#2D5A54] font-medium">Get notified when {matchedTherapist?.name} is online</p>
                    </div>
                    <button 
                      onClick={requestNotifications}
                      className="px-3 py-1.5 bg-[#2D5A54] text-white text-xs rounded-lg"
                    >
                      Allow
                    </button>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="py-4">
                <div className="relative flex items-center">
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAnswer(inputText)}
                    placeholder="Type your message..."
                    className="w-full bg-[#F5F5F5] border-none rounded-full py-4 pl-6 pr-14 text-sm focus:ring-1 focus:ring-[#2D5A54] transition-all placeholder:text-[#9A9A9A]"
                  />
                  <button 
                    onClick={() => handleAnswer(inputText)}
                    disabled={!inputText.trim()}
                    className="absolute right-2 p-2 bg-[#2D5A54] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-8"
            >
              <div className="w-20 h-20 bg-[#E8F3F1] rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-[#8AB6B0]" />
              </div>
              
              <div className="space-y-6 max-w-md">
                <div className="p-6 bg-white rounded-3xl shadow-sm border border-[#F0F0F0] space-y-4">
                  <p className="text-sm text-[#7A7A7A] leading-relaxed italic">
                    "This is not a professional assessment, only a category used to help narrow your concerns in order to help the most."
                  </p>
                  <div className="h-px bg-[#F0F0F0] w-full" />
                  <h3 className="text-xl font-medium text-[#2D5A54]">Your Match: {matchedTherapist?.name}</h3>
                  <p className="text-sm text-[#6A6A6A] leading-relaxed">
                    {matchedTherapist?.bio}
                  </p>
                </div>

                <button 
                  onClick={goToChat}
                  className="w-full py-4 bg-[#2D5A54] text-white rounded-2xl hover:bg-[#244943] transition-colors font-medium"
                >
                  Connect with {matchedTherapist?.name}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Emergency Modal */}
      <AnimatePresence>
        {showEmergency && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 bg-red-50 rounded-2xl">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <button onClick={() => setShowEmergency(false)} className="p-2 hover:bg-[#F5F5F5] rounded-full">
                  <X className="w-5 h-5 text-[#9A9A9A]" />
                </button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#2D5A54]">Emergency Help</h3>
                <p className="text-sm text-[#7A7A7A]">If you are in immediate danger or need urgent help, please call one of these numbers in Canada:</p>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Emergency Services', number: '911' },
                  { label: 'Suicide Crisis Helpline', number: '988' },
                  { label: 'Assaulted Women’s Helpline', number: '1-886-863-0511' }
                ].map((item, idx) => (
                  <a 
                    key={idx}
                    href={`tel:${item.number.replace(/-/g, '')}`}
                    className="flex items-center justify-between p-4 bg-[#FDFCFB] border border-[#F0F0F0] rounded-2xl hover:border-red-200 hover:bg-red-50 transition-all group"
                  >
                    <div>
                      <p className="text-xs text-[#9A9A9A]">{item.label}</p>
                      <p className="text-lg font-medium text-[#2D5A54] group-hover:text-red-600">{item.number}</p>
                    </div>
                    <Phone className="w-5 h-5 text-[#8AB6B0] group-hover:text-red-500" />
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
