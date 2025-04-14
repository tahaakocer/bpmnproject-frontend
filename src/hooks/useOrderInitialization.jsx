import { useState } from 'react';
import { initializeOrder } from '../services/orderService';

const useOrderInitialization = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiateOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await initializeOrderRequest({
        product: {
          isDraft: true
        }
      });
      setOrderData(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    orderData, 
    loading, 
    error, 
    initiateOrder 
  };
};

export default useOrderInitialization;