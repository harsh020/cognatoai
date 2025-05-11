import {request} from "@/lib/utils";


export const USER_APIS = {
  create: (data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/users/`,
      method: 'POST',
      data: data,
      ...configs
    })
  },

  update: (data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/users/`,
      method: 'PATCH',
      data: data,
      ...configs
    })
  },

  retrieve: (configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/users/`,
      method: 'GET',
      ...configs
    })
  },

  changePassword: (data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/users/change-password/`,
      method: 'POST',
      data: data,
      ...configs
    })
  }
}