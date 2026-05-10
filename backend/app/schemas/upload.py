from pydantic import BaseModel, ConfigDict


class UploadRead(BaseModel):
    id: int
    filename: str
    content_type: str
    size_bytes: int

    model_config = ConfigDict(from_attributes=True)
