import {request} from "@/lib/utils";


export const CANDIDATE_APIS = {
  create: (data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/entities/candidates/`,
      method: 'POST',
      data: data,
      ...configs
    })
  },

  retrieve: (id, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/entities/candidates/${id}/`,
      method: 'GET',
      ...configs
    })
  },

  update: (id, data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/entities/candidates/${id}/`,
      method: 'PATCH',
      data: data,
      ...configs
    })
  },

  list: (params, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/entities/candidates/`,
      method: 'GET',
      params: params,
      ...configs
    })
  }
}