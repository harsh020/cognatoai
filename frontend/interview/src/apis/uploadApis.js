import {UTILS} from "../commons/utils";
import {CONFIG} from "../commons/config";


export const UPLOAD_APIS = {
  audio: (data) => {
    return UTILS.request({
      baseURL: CONFIG.UPLOAD_BACKEND_URL,
      url: `/api/v1/uploads/audio/`,
      method: 'POST',
      data: data,
    })
  },

  video: (data) => {
    return UTILS.request({
      baseURL: CONFIG.UPLOAD_BACKEND_URL,
      url: `/api/v1/uploads/video/`,
      method: 'POST',
      data: data,
    })
  }
}
