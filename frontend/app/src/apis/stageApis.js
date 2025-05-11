import {request} from "@/lib/utils";


export const STAGE_APIS = {
  list: (id, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v2/stages`,
      method: 'GET',
      ...configs
    })
  },

}
