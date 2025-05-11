import {request} from "@/lib/utils";

export const SUBSCRIPTION_APIS = {
  create: (data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/billings/subscriptions/`,
      method: 'POST',
      data: data,
      ...configs
    })
  },

  retrieve: (id, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/billings/subscriptions/${id}/`,
      method: 'GET',
      ...configs
    })
  },

  active: (configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/billings/subscriptions/active/`,
      method: 'GET',
      ...configs
    })
  },

  list: (params, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/billings/subscriptions/`,
      method: 'GET',
      params: params,
      ...configs
    })
  }
}