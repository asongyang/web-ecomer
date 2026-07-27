import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Verify = () => {
    const { axios, navigate, setCartItems } = useAppContext();
    const [searchParams] = useSearchParams();
    
    const success = searchParams.get('success');
    const orderId = searchParams.get('orderId');

    const verifyPayment = async () => {
        try {
            if (!orderId) {
                navigate('/');
                return;
            }
            
            const { data } = await axios.post('/api/order/verifyStripe', { success, orderId });
            
            if (data.success) {
                setCartItems({}); // Clear cart
                toast.success(data.message || "Payment Successful");
                navigate('/my-order');
            } else {
                toast.error(data.message || "Payment Failed or Cancelled");
                navigate('/cart');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
            navigate('/cart');
        }
    }

    useEffect(() => {
        verifyPayment();
    }, [success, orderId])

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium text-lg">Verifying your payment...</p>
            </div>
        </div>
    )
}

export default Verify;
