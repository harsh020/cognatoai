import {UTILS} from "../commons/utils";
import {CONFIG} from "../commons/config";


export const INTERVIEW_APIS = {
  retrieve: (id) => {
    return UTILS.request({
      baseURL: CONFIG.APP_BACKEND_URL,
      url: `/api/v2/interviews/${id}/`,
      method: 'GET',
    })
  },

  continue: (id, data) => {
    return UTILS.request({
      baseURL: CONFIG.APP_BACKEND_URL,
      url: `/api/v2/interviews/${id}/`,
      method: 'POST',
      data: data,
    })
  },

  continueE2E: (id, data) => {
    return UTILS.request({
      baseURL: CONFIG.APP_BACKEND_URL,
      url: `/api/v2/interviews/${id}/e2e/`,
      method: 'POST',
      data: data,
    })
  },

  end: (id, data) => {
    return UTILS.request({
      baseURL: CONFIG.APP_BACKEND_URL,
      url: `/api/v2/interviews/${id}/end/`,
      method: 'PATCH',
      data: data
    })
  },

  recording: (data) => {
    return UTILS.request({
      baseURL: CONFIG.APP_BACKEND_URL,
      url: `/api/v2/interviews/record/`,
      method: 'POST',
      data: data
    })
  }
}
