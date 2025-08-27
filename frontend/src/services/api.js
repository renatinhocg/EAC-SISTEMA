
import axios from 'axios';

const isLocal = window.location.hostname === 'localhost';
const api = axios.create({
	baseURL: isLocal
		? 'http://localhost:3001/api'
		: 'https://eac-pwa-project-production.up.railway.app/api',
});

export default api;
