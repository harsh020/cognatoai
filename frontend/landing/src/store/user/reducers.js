import {
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_REGISTER_RESET,

  USER_EMAIL_VERIFICATION_REQUEST,
  USER_EMAIL_VERIFICATION_SUCCESS,
  USER_EMAIL_VERIFICATION_FAIL,
  USER_EMAIL_VERIFICATION_RESET,

  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGIN_RESET,

  OTP_SEND_REQUEST,
  OTP_SEND_SUCCESS,
  OTP_SEND_FAIL,
  OTP_SEND_RESET,

  USER_RETRIEVE_REQUEST,
  USER_RETRIEVE_SUCCESS,
  USER_RETRIEVE_FAIL,
  USER_RETRIEVE_RESET, USER_LOGOUT_REQUEST, USER_LOGOUT_SUCCESS, USER_LOGOUT_RESET,
} from "./constants";


export const register = (state={}, action) => {
  switch (action.type) {
    case USER_REGISTER_REQUEST:
      return { loading: true }

    case USER_REGISTER_SUCCESS:
      return {
        loading: false,
        user: action.payload
      }

    case USER_REGISTER_FAIL:
      return {
        loading: false,
        error: action.payload
      }

    case USER_REGISTER_RESET:
      return {}

    default:
      return state
  }
}

export const verifyEmail = (state={}, action) => {
  switch (action.type) {
    case USER_EMAIL_VERIFICATION_REQUEST:
      return { loading: true }

    case USER_EMAIL_VERIFICATION_SUCCESS:
      return {
        loading: false,
        user: action.payload
      }

    case USER_EMAIL_VERIFICATION_FAIL:
      return {
        loading: false,
        error: action.payload
      }

    case USER_EMAIL_VERIFICATION_RESET:
      return {}

    default:
      return state
  }
}

export const sendOtp = (state={}, action) => {
  switch (action.type) {
    case OTP_SEND_REQUEST:
      return { loading: true }

    case OTP_SEND_SUCCESS:
      return {
        loading: false,
        otp: action.payload
      }

    case OTP_SEND_FAIL:
      return {
        loading: false,
        error: action.payload
      }

    case OTP_SEND_RESET:
      return {}

    default:
      return state
  }
}

export const authenticate = (state={}, action) => {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return { loading: true }

    case USER_LOGIN_SUCCESS:
      return {
        loading: false,
        user: action.payload
      }

    case USER_LOGIN_FAIL:
      return {
        loading: false,
        error: action.payload
      }

    case USER_LOGIN_RESET:
      return {}

    default:
      return state
  }
}

export const retrieve = (state={}, action) => {
  switch (action.type) {
    case USER_RETRIEVE_REQUEST:
      return { loading: true }

    case USER_RETRIEVE_SUCCESS:
      return {
        loading: false,
        user: action.payload
      }

    case USER_RETRIEVE_FAIL:
      return {
        loading: false,
        error: action.payload
      }

    case USER_RETRIEVE_RESET:
      return {}

    default:
      return state
  }
}


export const logout = (state={}, action) => {
  switch (action.type) {
    case USER_LOGOUT_REQUEST:
      return { loading: true }

    case USER_LOGOUT_SUCCESS:
      return {
        loading: false,
        logout: action.payload
      }

    case USER_LOGOUT_RESET:
      return {}

    default:
      return state
  }
}