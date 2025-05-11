import {
  ACTIVITY_BULK_CREATE_REQUEST,
  ACTIVITY_BULK_CREATE_SUCCESS,
  ACTIVITY_BULK_CREATE_FAILED,
  ACTIVITY_BULK_CREATE_RESET,
} from "./activityConstants";



export const createBulkActivity = (state={}, action) => {
  switch (action.type) {
    case ACTIVITY_BULK_CREATE_REQUEST:
      return { loading: true }

    case ACTIVITY_BULK_CREATE_SUCCESS:
      return {
        loading: false,
        activity: action.payload
      }

    case ACTIVITY_BULK_CREATE_FAILED:
      return {
        loading: false,
        error: action.payload
      }

    case ACTIVITY_BULK_CREATE_RESET:
      return {}

    default:
      return state
  }
}
