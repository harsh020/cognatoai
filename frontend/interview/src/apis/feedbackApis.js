import {UTILS} from "../commons/utils";
import {CONFIG} from "../commons/config";


export const FEEDBACK_APIS = {
  create: (data) => {
    return UTILS.request({
      baseURL: CONFIG.APP_BACKEND_URL,
      url: `/api/v2/feedbacks/platform/`,
      method: 'POST',
      data: data,
    })
  }
}