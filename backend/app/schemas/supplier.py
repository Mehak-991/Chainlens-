from pydantic import BaseModel
from typing import List, Optional

class SupplierBase(BaseModel):
    id: str
    name: str
    tier: str
    country: str
    status: str

class SupplierDetail(SupplierBase):
    pass
