import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export const stockService = {
  getQuote: (ticker) => api.get(`/stocks/quote/${ticker}`),
  searchStocks: (query) => api.get(`/stocks/search?q=${query}`),
};

export const portfolioService = {
  getPortfolio: (userId) => api.get(`/portfolio/${userId}`),
  buyStock: (data) => api.post('/portfolio/buy', data),
  sellStock: (data) => api.post('/portfolio/sell', data),
};

export default api;
