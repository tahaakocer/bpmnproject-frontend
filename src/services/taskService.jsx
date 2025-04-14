import api from './apiClient';
// Process ID'ye göre task getirme
export const getTasksByProcessInstanceId = async (processInstanceId) => {
    try {
      console.log('Task bilgisi getiriliyor. ProcessInstanceId:', processInstanceId);
      
      const response = await api.get(
        'http://localhost:8181/api/starter-process/get-tasks-by-process-instance-id', 
        { 
          params: { processInstanceId } 
        }
      );
      
      console.log('Task getirme API cevabı:', response.data);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('Task getirme başarılı:', response.data.data[0]);
        return response.data.data[0]; // İlk taskı döndür
      } else {
        console.log('Aktif task bulunamadı');
        return null;
      }
    } catch (error) {
      console.error('Task getirme hatası:', error);
      throw error;
    }
  };
  
  // Task tamamlama
  export const completeTask = async (taskId) => {
    try {
      console.log('Task tamamlanıyor. TaskId:', taskId);
      
      const response = await api.post(
        `http://localhost:8181/api/starter-process/complete-task`,
        null,
        { params: { taskId } }
      );
      
      console.log('Task tamamlama başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Task tamamlama hatası:', error);
      throw error;
    }
  };
  
  // Mesaj gönderme
  export const sendMessage = async (processInstanceId, messageName) => {
    try {
      console.log(`Mesaj gönderiliyor. ProcessInstanceId: ${processInstanceId}, MessageName: ${messageName}`);
      
      const response = await api.post(
        `http://localhost:8181/api/starter-process/send-message`,
        null,
        { params: { processInstanceId, messageName } }
      );
      
      console.log('Mesaj gönderme başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      throw error;
    }
  };
  function bekle(milisaniye) {
    return new Promise(resolve => setTimeout(resolve, milisaniye));
  }
  