import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ManagerLogin = () => {
    const { isManager, setIsManager, navigate, axios } = useAppContext();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onsubmitHandler = async (event) => {
        event.preventDefault();
        try {
            // Replace with your actual manager login endpoint
            const { data } = await axios.post('/api/manager/login', { email, password });
            if (data.success) {
                setIsManager(true);
                toast.success("Login Successful");
                navigate('/manager'); // Navigate to manager dashboard
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Removed forceful redirect to /manager on load

    return !isManager && (
        <div className="min-h-screen relative flex items-center justify-center bg-[#f4f6f9]">
            {/* Top green background */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-[#0fa958]"></div>
            
            <form onSubmit={onsubmitHandler} className="relative z-10 w-full max-w-[500px] px-4">
                <div className="bg-white rounded shadow-2xl p-10 flex flex-col gap-6">
                    <h2 className="text-2xl font-bold text-center text-[#1a2b4c] mb-2">Manager</h2>

                    <div className="w-full">
                        <label className="block text-[#9ba6b5] text-xs font-medium mb-1.5">Email (Admin)</label>
                        <input 
                            onChange={(e) => setEmail(e.target.value)} 
                            value={email}
                            type="email" 
                            className="w-full bg-[#edf2f9] text-[#2c3e50] p-3 focus:outline-none focus:ring-2 focus:ring-[#0fa958]/50" 
                            required 
                        />
                    </div>
                    
                    <div className="w-full">
                        <label className="block text-[#9ba6b5] text-xs font-medium mb-1.5">Password</label>
                        <input 
                            onChange={(e) => setPassword(e.target.value)} 
                            value={password}
                            type="password"  
                            className="w-full bg-[#edf2f9] text-[#2c3e50] p-3 focus:outline-none focus:ring-2 focus:ring-[#0fa958]/50" 
                            required
                        />
                    </div>
                    
                    <button type="submit" className="w-full bg-[#00c957] hover:bg-[#00b34d] text-white font-bold py-3 px-4 rounded transition-colors mt-2 cursor-pointer">
                        Sign In
                    </button>

                    <div className="flex justify-between items-end mt-6">
                        <div className="text-[#0fa958] text-xs font-medium leading-snug">
                            Thank you.<br/>Please sign in to continue.
                        </div>
                        <div className="text-[#64748b] text-[10px] font-bold flex items-center gap-1 leading-tight">
                           <svg className="w-4 h-4 opacity-50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                           <span>COMPANY<br/>LOGO</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ManagerLogin;
