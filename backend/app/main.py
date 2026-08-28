from contextlib import asynccontextmanager
from fastapi import FastAPI, status, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database.driver import db
from app.routes import suppliers, risk_events, graph
from neo4j.exceptions import Neo4jError, ServiceUnavailable
import logging
import os

# Configure application logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("chainlens.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing ChainLens API Application Lifespan...")
    try:
        db.connect()
    except Exception as e:
        logger.warning(f"Lifespan startup database connection warning: {e}")
    yield
    logger.info("Shutting down ChainLens API Application Lifespan...")
    db.close()

app = FastAPI(
    title="ChainLens API",
    description="Supply Chain Risk Explorer API - Provides downstream blast radius calculations.",
    version="0.1.0",
    lifespan=lifespan
)

# Enable CORS for the local dev environment origin securely
# Read additional allowed origins from environment (used for production/Vercel deployment)
_extra_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://10.103.121.88:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        *_extra_origins
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Database Availability & Unhandled Exception Handler
@app.exception_handler(ServiceUnavailable)
async def service_unavailable_handler(request: Request, exc: ServiceUnavailable):
    logger.error(f"CognoDB connectivity ServiceUnavailable dropout: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "status": "unhealthy",
            "database": "unavailable",
            "detail": "Database connection drop detected. Operational services temporarily unavailable."
        }
    )

@app.exception_handler(Neo4jError)
async def neo4j_error_handler(request: Request, exc: Neo4jError):
    logger.error(f"CognoDB exception Neo4jError: {str(exc)}")
    # If connection error, return 503, otherwise standard 500
    if "connection" in str(exc).lower() or "uri" in str(exc).lower():
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": "unavailable",
                "detail": "Database connectivity problem."
            }
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal graph transaction query error occurred."}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    exc_str = str(exc)
    # Map driver and connection dropouts to clean Service Unavailable HTTP 503 responses
    if "Connection" in exc_str or "driver" in exc_str or "Failed to establish connection" in exc_str or "ServiceUnavailable" in exc_str:
        logger.error(f"Database availability dropout exception: {exc_str}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": "unavailable",
                "detail": "Database connection drop detected. Operational services temporarily unavailable."
            }
        )
    logger.error(f"Unhandled system error on path {request.url.path}: {exc_str}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected internal server error occurred."}
    )

# Register routes
app.include_router(suppliers.router)
app.include_router(risk_events.router)
app.include_router(graph.router)

@app.get("/api/health")
async def health_check():
    is_connected = db.verify_connectivity()
    if is_connected:
        return {
            "status": "healthy",
            "database": "connected"
        }
    else:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": "unavailable"
            }
        )
