import {request} from "@/lib/utils";


export const ORGANIZATION_APIS = {
  create: (data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/organizations/`,
      method: 'POST',
      data: data,
      ...configs
    })
  },

  update: (id, data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/organizations/${id}/`,
      method: 'PATCH',
      data: data,
      ...configs
    })
  },

  retrieve: (id, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/organizations/${id}/`,
      method: 'GET',
      ...configs
    })
  },

  list: (params, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/organizations/`,
      method: 'GET',
      params: params,
      ...configs
    })
  }
}