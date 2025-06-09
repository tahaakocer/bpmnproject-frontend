import api from './apiClient';

// PartyRole bilgilerini getirme
export const getPartyRoleByOrderRequestId = async (orderRequestId) => {
  try {
    const response = await api.post(`http://localhost:8484/api/crm/get-party-role-by-order-request-id`, {
      orderRequestId
    });
    
    console.log('PartyRole getirme başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('PartyRole getirme hatası:', error);
    throw error;
  }
};

// Account bilgilerini getirme
export const getAccountByOrderId = async (orderRequestId) => {
  try {
    const response = await api.post(`http://localhost:8585/api/crm/account/get-by-order-id`, {
      orderRequestId
    });
    
    console.log('Account getirme başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Account getirme hatası:', error);
    throw error;
  }
};

// Agreement bilgilerini getirme
export const getAgreementByOrderId = async (orderRequestId) => {
  try {
    const response = await api.post(`http://localhost:8686/api/agreement/get-by-order-id`, {
      orderRequestId
    });
    
    console.log('Agreement getirme başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Agreement getirme hatası:', error);
    throw error;
  }
};