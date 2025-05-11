from rest_framework.response import Response


def success_response(data=None, message="Request was successful", status=200):
    return Response({
        "status": "success",
        "message": message,
        "data": data
    }, status=status)


def error_response(errors, message="There was an error with your request", status=400):
    print(errors)
    return Response({
        "status": "error",
        "message": message,
        "errors": errors
    }, status=status)


def list_response(entity, data, status=200):
    return Response({
        'entity': entity,
        'data': data
    }, status=status)