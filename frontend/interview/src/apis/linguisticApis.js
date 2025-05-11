import {UTILS} from "../commons/utils";
import {CONFIG} from "../commons/config";


export const LINGUISTIC_APIS = {
  // transcribe: (data) => {
  //   return UTILS.request({
  //     baseURL: CONFIG.STT_BACKEND_URL,
  //     url: '/inference',
  //     method: 'POST',
  //     data: data
  //   })
  // },
  // transcribe: (data) => {
  //   return UTILS.request({
  //     baseURL: CONFIG.APP_BACKEND_URL,
  //     url: '/api/v1/linguistics/transcribe/',
  //     method: 'POST',
  //     data: data
  //   })
  // }
  // transcribe: (data) => {
  //   return UTILS.request({
  //     baseURL: CONFIG.LINGUISTICS_BACKEND_URL,
  //     url: '/api/v1/linguistics/stt/',
  //     method: 'POST',
  //     data: data
  //   })
  // },
  // speak: (data) => {
  //   return UTILS.request({
  //     baseURL: CONFIG.LINGUISTICS_BACKEND_URL,
  //     url: '/api/v1/linguistics/tss/',
  //     method: 'POST',
  //     data: data
  //   })
  // },
  // transcribe: (data) => {
  //   return UTILS.request({
  //     baseURL: 'http://localhost:8080',
  //     url: '/inference',
  //     method: 'POST',
  //     data: data,
  //   })
  // },
  transcribe: (data) => {
    return UTILS.request({
      baseURL: CONFIG.LINGUISTICS_BACKEND_URL,
      url: '/api/v1/listen/',
      method: 'POST',
      data: data
    })
  },
  speak: (data, config) => {
    return UTILS.request({
      baseURL: CONFIG.LINGUISTICS_BACKEND_URL,
      url: '/api/v1/speak/',
      method: 'POST',
      data: data,
      ...config
    })
  },

  transcribeWarmup: () => {
    return UTILS.request({
      baseURL: CONFIG.LINGUISTICS_BACKEND_URL,
      url: '/api/v1/listen/',
      method: 'GET',
    })
  }
}