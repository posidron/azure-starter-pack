import os

import azure.functions as func
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from utilities.exceptions import ApiException

from . import routes

if os.getenv("FUNCTIONS_WORKER_RUNTIME"):
    app = FastAPI(
        version="0.0.1",
        servers=[{"url": "/api", "description": "Azure Functions as a FastAPI server"}],
        root_path="/public",
        root_path_in_servers=False,
    )
else:
    app = FastAPI()

app.include_router(routes.router)


@app.exception_handler(ApiException)
async def generic_api_exception_handler(request: Request, error: ApiException):
    """
    Generic API exception handler.
    Ensures that all thrown exceptions of the custom type API Excpetion are
    returned in a unified format.
    Args:
        request (Request): HTTP Request
        error (ApiException): Thrown exception

    Returns:
        JSONResponse: Returns the exception in JSON format
    """
    return JSONResponse(
        status_code=error.status_code,
        content={"code": error.code, "description": error.description},
    )


async def main(req: func.HttpRequest, context: func.Context) -> func.HttpResponse:
    """
    Azure function entry point. All web requests are handled by FastAPI.
    Args:
        req (func.HttpRequest): Request
        context (func.Context): Azure Function Context

    Returns:
        func.HttpResponse: HTTP Response
    """
    return await func.AsgiMiddleware(app).handle_async(req, context)
