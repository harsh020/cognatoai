import {request} from "@/lib/utils";


export const JOB_APIS = {
  create: (data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/jobs/`,
      method: 'POST',
      data: data,
      ...configs
    })
  },

  retrieve: (id, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/jobs/${id}/`,
      method: 'GET',
      ...configs
    })
  },

  update: (id, data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/jobs/${id}/`,
      method: 'PATCH',
      data: data,
      ...configs
    })
  },

  list: (params, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/jobs/`,
      method: 'GET',
      params: params,
      ...configs
    })
  }
}