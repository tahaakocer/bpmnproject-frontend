import api from './apiClient';

// TCKN ile sipariş isteği getirme
export const getOrderRequestByTckn = async (tckn) => {
  try {
    const response = await api.get(`/api/initialize/get-order-request`, {
      params: { tckn }
    });
    
    console.log('TCKN ile sipariş getirme başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('TCKN ile sipariş getirme hatası:', error);
    throw error;
  }
};

// İleride kullanılacak diğer servisler için placeholder'lar
export const getOrderRequestByAccountCode = async (accountCode) => {
  try {
    const response = await api.get(`/api/initialize/get-order-request`, {
      params: { accountCode }
    });
    
    console.log('Account Code ile sipariş getirme başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Account Code ile sipariş getirme hatası:', error);
    throw error;
  }
};

export const getOrderRequestByEmail = async (email) => {
  try {
    const response = await api.get(`/api/initialize/get-order-request`, {
      params: { email }
    });
    
    console.log('E-posta ile sipariş getirme başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('E-posta ile sipariş getirme hatası:', error);
    throw error;
  }
};

export const getOrderRequestByPhone = async (phoneNumber) => {
  try {
    const response = await api.get(`/api/initialize/get-order-request`, {
      params: { phoneNumber }
    });
    
    console.log('Telefon ile sipariş getirme başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Telefon ile sipariş getirme hatası:', error);
    throw error;
  }
};