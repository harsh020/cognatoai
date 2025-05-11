import {UTILS} from "../commons/utils";
import {CONFIG} from "../commons/config";


export const ACTIVITY_APIS = {
  bulkCreate: (data) => {
    return UTILS.request({
      baseURL: CONFIG.APP_BACKEND_URL,
      url: `/api/v1/activities/bulk/`,
      method: 'POST',
      data: data,
    })
  }
}
