import {UTILS} from "../commons/utils";
import {CONFIG} from "../commons/config";


export const WAITLIST_APIS = {
  create: (data) => {
    return UTILS.request({
      baseURL: CONFIG.APP_BACKEND_URL,
      url: `/api/v1/waitlists/`,
      method: 'POST',
      data: data,
    })
  },

  update: (id, data) => {
    return UTILS.request({
      baseURL: CONFIG.APP_BACKEND_URL,
      url: `/api/v1/waitlists/${id}/`,
      method: 'PATCH',
      data: data,
    })
  }
}