import {request} from "@/lib/utils";


export const REVIEW_APIS = {
  create: (data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/reviews/`,
      method: 'POST',
      data: data,
      ...configs
    })
  },

  retrieve: (id, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/reviews/${id}`,
      method: 'GET',
      ...configs
    })
  },

  list: (id, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/reviews`,
      method: 'GET',
      ...configs
    })
  },

}