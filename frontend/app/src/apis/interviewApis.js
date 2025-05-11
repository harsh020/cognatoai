import {request} from "@/lib/utils";


export const INTERVIEW_APIS = {
  create: (data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v2/interviews/`,
      method: 'POST',
      data: data,
      ...configs
    })
  },

  bulkCreate: (data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v2/interviews/bulk/`,
      method: 'POST',
      data: data,
      ...configs
    })
  },

  retrieve: (id, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v2/interviews/${id}/`,
      method: 'GET',
      ...configs
    })
  },

  update: (id, data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v2/interviews/${id}/`,
      method: 'PATCH',
      data: data,
      ...configs
    })
  },

  list: (params, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v2/interviews/`,
      method: 'GET',
      params: params,
      ...configs
    })
  },

  downloadResult: (id, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v2/interviews/${id}/result`,
      method: 'GET',
      ...configs
    })
  },

  summary: (configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v2/interviews/summary`,
      method: 'GET',
      ...configs
    })
  },

  dailySummary: (params, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v2/interviews/daily-summary`,
      method: 'GET',
      params: params,
      ...configs
    })
  },

  recentUpcoming: (configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v2/interviews/recent-upcoming`,
      method: 'GET',
      ...configs
    })
  },

  scheduled: (params, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v2/interviews/scheduled`,
      method: 'GET',
      params: params,
      ...configs
    })
  },
}
