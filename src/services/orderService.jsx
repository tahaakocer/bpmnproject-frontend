import api from './apiClient';

export const initializeOrder = async () => {
  try {
    const requestBody = {
      product: {
        isDraft: true
      }
    };
    
    const response = await api.post('/api/initialize/PRODUCT/create-order-request', requestBody, {
      params: { channel: 'STARTER' }
    });
    
    console.log('Sipariş başlatma başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Sipariş başlatma hatası:', error);
    throw error;
  }
};

// Sipariş güncelleme
export const updateOrderRequest = async (processInstanceId, requestBody) => {
  try {
    // API yolu doğru şekilde tanımlanmış
    const response = await api.patch(
      `/api/initialize/${processInstanceId}/update-order-request`, 
      requestBody
    );
    
    console.log('Sipariş güncelleme başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Sipariş güncelleme hatası:', error);
    throw error;
  }
};