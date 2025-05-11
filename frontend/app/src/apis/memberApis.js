import {request} from "@/lib/utils";


export const MEMBER_APIS = {
  create: (orgId, data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/organizations/${orgId}/members/`,
      method: 'POST',
      data: data,
      ...configs
    })
  },

  update: (id, orgId, data, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/organizations/${orgId}/members/${id}/`,
      method: 'PATCH',
      data: data,
      ...configs
    })
  },

  retrieve: (id, orgId, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/organizations/${orgId}/members/${id}/`,
      method: 'GET',
      ...configs
    })
  },

  list: (id, orgId, params, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/organziations/${orgId}/members/${id}/`,
      method: 'GET',
      params: params,
      ...configs
    })
  }
}