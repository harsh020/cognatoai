import {request} from "@/lib/utils";


export const USER_APIS = {
  register: (data) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: '/api/v1/users/signup/',
      method: 'POST',
      data: data
    })
  },

  authenticate: (data) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: '/api/v1/users/login/',
      method: 'POST',
      data: data
    })
  },

  retrieve: () => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/users/`,
      method: 'GET',
    })
  },

  update: () => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/users/`,
      method: 'PATCH',
    })
  },

  sendOtp: (data, config) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/users/otp/`,
      method: 'POST',
      data: data,
      ...config
    })
  },

  verifyOtp: (data, config) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/users/otp/`,
      method: 'PATCH',
      data: data,
      ...config
    })
  }
}