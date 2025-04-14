import axios from 'axios';

export const getToken = async () => {
    try {
        const tokenResponse = await axios.get('http://localhost:8181/api/token');
        console.log('Token başarıyla alındı:', tokenResponse.data);
        return tokenResponse.data.access_token;
    } catch (error) {
        console.error('Token alma hatası:', error);
        throw error;
    }
};