from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    data = response.data
    if isinstance(data, dict) and "detail" in data:
        response.data = {"message": str(data["detail"])}
    elif isinstance(data, list):
        response.data = {"message": str(data[0]) if data else "Solicitud inválida."}
    else:
        response.data = {"message": "Revisa los datos enviados.", "errors": data}
    return response
