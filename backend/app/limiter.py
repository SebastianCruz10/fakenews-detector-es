from slowapi import Limiter
from slowapi.util import get_remote_address

# Singleton compartido entre main.py (registro) y routers (decoradores)
limiter = Limiter(key_func=get_remote_address)
