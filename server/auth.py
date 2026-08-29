"""
server/auth.py
--------------
FastAPI dependency for Firebase ID token verification.

Uses the Firebase Identity Toolkit REST API (v1/accounts:lookup) so that no
service-account private key is required — the same Web API key already
present in .env as NEXT_PUBLIC_FIREBASE_API_KEY is sufficient.
"""

import os
import requests as _http

from fastapi import Header, HTTPException

# Accept either key name to stay flexible across environments.
_FIREBASE_API_KEY: str = (
    os.environ.get("FIREBASE_API_KEY")
    or os.environ.get("NEXT_PUBLIC_FIREBASE_API_KEY", "")
)

_LOOKUP_URL = (
    "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={key}"
)


def get_current_user(authorization: str = Header(...)) -> dict:
    """
    FastAPI `Depends` function.

    Validates the Firebase ID token supplied in the `Authorization: Bearer
    <token>` header by calling the Firebase Identity Toolkit REST API, then
    returns a dict with ``uid``, ``email``, and ``name`` keys.

    Raises
    ------
    HTTP 401  — missing / malformed / expired token, or no API key configured.
    """
    if not _FIREBASE_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Server is missing FIREBASE_API_KEY / NEXT_PUBLIC_FIREBASE_API_KEY.",
        )

    # ── 1. Extract bearer token ───────────────────────────────────────────
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authorization header must be 'Bearer <token>'.",
        )
    token = authorization[len("Bearer "):]

    # ── 2. Verify with Firebase Identity Toolkit ──────────────────────────
    try:
        resp = _http.post(
            _LOOKUP_URL.format(key=_FIREBASE_API_KEY),
            json={"idToken": token},
            timeout=5,
        )
    except _http.exceptions.Timeout:
        raise HTTPException(status_code=401, detail="Token verification timed out.")
    except _http.exceptions.RequestException as exc:
        raise HTTPException(status_code=401, detail=f"Token verification network error: {exc}")

    if resp.status_code != 200:
        # Firebase returns 400 for invalid / expired tokens.
        raise HTTPException(status_code=401, detail="Invalid or expired Firebase token.")

    users = resp.json().get("users", [])
    if not users:
        raise HTTPException(status_code=401, detail="Token resolved to no user.")

    user = users[0]
    return {
        "uid": user["localId"],
        "email": user.get("email", ""),
        "name": user.get("displayName", ""),
    }
