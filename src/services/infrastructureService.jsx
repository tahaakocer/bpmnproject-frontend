import api from './apiClient';

// BBK ile maksimum hız bilgisini getir
export const getMaxSpeedInfo = async (bbk) => {
  try {
    const response = await api.get(`http://localhost:8383/api/infrastructure-service/max-speed-from-tt?bbk=${bbk}`);
    console.log('Maksimum hız bilgisi başarıyla getirildi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Maksimum hız bilgisi getirme hatası:', error);
    throw error;
  }
};