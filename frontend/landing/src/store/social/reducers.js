import {
  SOCIAL_AUTH_REDIRECT_REQUEST,
  SOCIAL_AUTH_REDIRECT_SUCCESS,
  SOCIAL_AUTH_REDIRECT_FAIL,
  SOCIAL_AUTH_REDIRECT_RESET,

  SOCIAL_AUTH_CALLBACK_REQUEST,
  SOCIAL_AUTH_CALLBACK_SUCCESS,
  SOCIAL_AUTH_CALLBACK_FAIL,
  SOCIAL_AUTH_CALLBACK_RESET,
} from "./constants";


export const redirect = (state={}, action) => {
  switch (action.type) {
    case SOCIAL_AUTH_REDIRECT_REQUEST:
      return { loading: true }

    case SOCIAL_AUTH_REDIRECT_SUCCESS:
      return {
        loading: false,
        socialAuth: action.payload
      }

    case SOCIAL_AUTH_REDIRECT_FAIL:
      return {
        loading: false,
        error: action.payload
      }

    case SOCIAL_AUTH_REDIRECT_RESET:
      return {}

    default:
      return state
  }
}

export const callback = (state={}, action) => {
  switch (action.type) {
    case SOCIAL_AUTH_CALLBACK_REQUEST:
      return { loading: true }

    case SOCIAL_AUTH_CALLBACK_SUCCESS:
      return {
        loading: false,
        user: action.payload
      }

    case SOCIAL_AUTH_CALLBACK_FAIL:
      return {
        loading: false,
        error: action.payload
      }

    case SOCIAL_AUTH_CALLBACK_RESET:
      return {}

    default:
      return state
  }
}
