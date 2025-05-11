from rest_framework import status
from rest_framework.views import exception_handler as rest_exception_handler
from common.responses import error_response

default_messages = {
    status.HTTP_400_BAD_REQUEST: "The request could not be understood or was missing required parameters.",
    status.HTTP_401_UNAUTHORIZED: "Authentication credentials were missing or incorrect.",
    status.HTTP_403_FORBIDDEN: "You do not have permission to perform this action.",
    status.HTTP_404_NOT_FOUND: "The requested resource could not be found.",
    status.HTTP_500_INTERNAL_SERVER_ERROR: "An unexpected error occurred on the server.",
    status.HTTP_502_BAD_GATEWAY: "The server received an invalid response from the upstream server.",
    status.HTTP_503_SERVICE_UNAVAILABLE: "The server is currently unavailable. Please try again later.",
}


def exception_handler(exc, context):
    response = rest_exception_handler(exc, context)

    if response is not None:
        return error_response(errors=response.data, message=default_messages.get(response.status_code), status=response.status_code)
    return error_response(errors=str(exc), message="An unhandled exception occurred", status=500)