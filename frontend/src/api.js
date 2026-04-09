import axios from 'axios'

const API = axios.create({ baseURL: 'https://casehub-api-a3d6che7ghaka6c7.centralindia-01.azurewebsites.net/api' })

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default API