import api from './apiClient';

export const getAllCharacteristics = async () => {
  try {
    const response = await api.get('/api/characteristic/get-all');
    return response.data;
  } catch (error) {
    console.error('Özellikleri getirme hatası:', error);
    throw error;
  }
};

export const getCharacteristicById = async (id) => {
  try {
    const response = await api.get(`/api/characteristic/get-by-id?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Özellik getirme hatası:', error);
    throw error;
  }
};

export const getCharacteristicByCode = async (code) => {
  try {
    const response = await api.get(`/api/characteristic/get-by-code?code=${code}`);
    return response.data;
  } catch (error) {
    console.error('Özellik getirme hatası:', error);
    throw error;
  }
};

export const createCharacteristic = async (characteristicData) => {
  try {
    const response = await api.post('/api/characteristic/create', characteristicData);
    return response.data;
  } catch (error) {
    console.error('Özellik oluşturma hatası:', error);
    throw error;
  }
};

export const deleteCharacteristic = async (id) => {
  try {
    const response = await api.delete(`/api/characteristic/delete-by-id?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Özellik silme hatası:', error);
    throw error;
  }
};