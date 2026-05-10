from pydantic import BaseModel, ConfigDict


class CaseItem(BaseModel):
    title: str
    place: str
    price: str
    image: str


class ReviewItem(BaseModel):
    author: str
    city: str
    text: str
    rating: int


class FaqItem(BaseModel):
    question: str
    answer: str


class PublicSettings(BaseModel):
    company_name: str
    phone: str
    whatsapp: str
    cities: list[str]
    personal_data_consent_text: str

    model_config = ConfigDict(extra="forbid")
