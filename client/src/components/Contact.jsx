import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import emailjs from '@emailjs/browser';

const Contact = ({ showContact, setShowContact }) => {
    const { t } = useTranslation();
    const [position, setPosition] = useState({ x: window.innerWidth / 2 - 160, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0 });
    const modalRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Chat flow state
    const [step, setStep] = useState(0); 
    // 0: ask name, 1: ask email, 2: ask title, 3: ask message, 4: done
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        title: '',
        message: ''
    });

    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: t('contact.subtitle', 'สวัสดีครับ มีอะไรให้เราช่วยเหลือไหมครับ?') },
        { id: 2, type: 'bot', text: t('contact.askName', 'กรุณากรอกชื่อ-นามสกุลของคุณ:') }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX - position.x,
            startY: e.clientY - position.y
        };
    };

    const handleMouseMove = React.useCallback((e) => {
        if (!isDragging) return;
        
        let newX = e.clientX - dragRef.current.startX;
        let newY = e.clientY - dragRef.current.startY;

        if (modalRef.current) {
            const rect = modalRef.current.getBoundingClientRect();
            const minX = 0;
            const minY = 0;
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;

            newX = Math.max(minX, Math.min(newX, maxX));
            newY = Math.max(minY, Math.min(newY, maxY));
        }

        setPosition({
            x: newX,
            y: newY
        });
    }, [isDragging]);

    const handleMouseUp = React.useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isSending) return;

        const currentInput = inputValue;
        const newUserMessage = { id: Date.now(), type: 'user', text: currentInput };
        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');

        let nextStep = step + 1;
        let nextFormData = { ...formData };

        if (step === 0) {
            nextFormData.name = currentInput;
            setStep(nextStep);
            setFormData(nextFormData);
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: 'อีเมลของคุณคืออะไร?' }]);
            }, 500);
        } else if (step === 1) {
            nextFormData.email = currentInput;
            setStep(nextStep);
            setFormData(nextFormData);
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: 'คุณต้องการติดต่อเรื่องอะไร (หัวข้อ)?' }]);
            }, 500);
        } else if (step === 2) {
            nextFormData.title = currentInput;
            setStep(nextStep);
            setFormData(nextFormData);
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: 'กรอกข้อความของคุณได้เลยครับ' }]);
            }, 500);
        } else if (step === 3) {
            nextFormData.message = currentInput;
            setFormData(nextFormData);
            setStep(4);
            setIsSending(true);
            
            // Call EmailJS
            try {
                emailjs.init("PaaxHsPDZ5mGRUipO");
                await emailjs.send('service_1mzvbm9', 'template_t9mm2nf', {
                    name: nextFormData.name,
                    email: nextFormData.email,
                    title: nextFormData.title,
                    message: nextFormData.message,
                });
                setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: '✅ ส่งข้อความสำเร็จ! ขอบคุณที่ติดต่อเรา' }]);
            } catch (error) {
                console.error('EmailJS Error:', error);
                setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: '❌ ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' }]);
                setStep(3); // allow retry for message
            } finally {
                setIsSending(false);
            }
        }
    };

    if (!showContact) return null;

    let placeholderText = "Enter your ...";
    if (step === 0) placeholderText = "ชื่อ-นามสกุล...";
    else if (step === 1) placeholderText = "อีเมล...";
    else if (step === 2) placeholderText = "หัวข้อ...";
    else if (step === 3) placeholderText = "ข้อความ...";
    else if (step === 4) placeholderText = "เสร็จสิ้น";

    return (
        <div 
            ref={modalRef}
            style={{ left: position.x, top: position.y }}
            className="fixed z-[99999] bg-white rounded-[12px] shadow-2xl border border-gray-200 w-80 sm:w-[350px] overflow-hidden"
        >
            <div 
                onMouseDown={handleMouseDown}
                className="bg-[#5cb85c] text-white px-4 py-3 flex justify-between items-center cursor-move"
            >
                <div className="flex items-center gap-3 select-none">
                    <div className="bg-white/20 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-wide">{t('contact.title', 'ติดต่อพวกเรา')}</h3>
                        <p className="text-xs text-white/90">Online</p>
                    </div>
                </div>
                <button onClick={() => setShowContact(false)} className="hover:bg-white/20 p-1.5 rounded transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            
            <div className="p-4 bg-gray-50/50 flex flex-col h-[350px]">
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4 flex flex-col gap-4 scroll-smooth">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                            {msg.type === 'bot' && (
                                <div className="w-7 h-7 rounded-full bg-[#e8f5e9] flex items-center justify-center shrink-0 mt-0.5 text-[#5cb85c]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12 2.1 7.1"></path><path d="M12 12l9.9 4.9"></path></svg>
                                </div>
                            )}
                            <div className={`shadow-sm py-2.5 px-4 text-sm max-w-[85%] break-words ${
                                msg.type === 'user' 
                                ? 'bg-[#5cb85c] text-white rounded-2xl rounded-tr-sm' 
                                : 'bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-tl-sm'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isSending && (
                        <div className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#e8f5e9] flex items-center justify-center shrink-0 mt-0.5 text-[#5cb85c]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12 2.1 7.1"></path><path d="M12 12l9.9 4.9"></path></svg>
                            </div>
                            <div className="bg-white border border-gray-100 shadow-sm text-gray-400 italic py-2.5 px-4 rounded-2xl rounded-tl-sm text-sm">
                                กำลังส่ง...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="flex gap-2 items-center border-t border-gray-100 pt-3">
                    <input 
                        type="text" 
                        value={inputValue} 
                        onChange={(e) => setInputValue(e.target.value)} 
                        placeholder={placeholderText}
                        disabled={step >= 4 || isSending}
                        className="flex-1 text-sm py-2.5 px-4 border border-gray-200 rounded-full focus:outline-none focus:border-[#5cb85c] transition-colors bg-white disabled:bg-gray-100"
                        required
                    />
                    <button type="submit" disabled={step >= 4 || isSending} className="bg-[#a8deb8] hover:bg-[#86cda2] disabled:bg-gray-300 text-white p-3 rounded-full transition-colors cursor-pointer shrink-0 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-45 ml-[-2px] mb-[-2px]" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Contact;
