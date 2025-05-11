import {request} from "@/lib/utils";


export const RECORDING_APIS = {
  retrieve: (id, configs) => {
    return request({
      baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
      url: `/api/v1/recordings/interviews/${id}/`,
      method: 'GET',
      ...configs
    })
  },
}
