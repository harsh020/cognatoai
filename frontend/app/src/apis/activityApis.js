import {request} from "@/lib/utils";


export const ACTIVITY_APIS = {
  retrieve: (id, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/activities/interviews/${id}/`,
      method: 'GET',
      ...configs
    })
  },
}
