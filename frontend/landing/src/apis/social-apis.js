import {request} from "@/lib/utils";


export const SOCIAL_APIS = {
  redirect: (data) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: '/api/v1/social/auth/redirect/',
      method: 'POST',
      data: data
    })
  },

  callback: (data) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: '/api/v1/social/auth/callback/',
      method: 'POST',
      data: data
    })
  },
}