import {request} from "@/lib/utils";


export const FEEDBACK_APIS = {
  retrieve: (id, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v2/feedbacks/interviews/${id}`,
      method: 'GET',
      ...configs
    })
  },
}
