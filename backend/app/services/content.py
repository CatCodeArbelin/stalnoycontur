from app.schemas.content import CaseItem, FaqItem, PublicSettings, ReviewItem

CASES = [
    CaseItem(title="Навес 6×8 м для двух авто", place="Симферополь", price="от 268 000 ₽", image="/images/case-1.svg"),
    CaseItem(title="Терраса с поликарбонатом", place="Ялта", price="от 184 000 ₽", image="/images/case-2.svg"),
    CaseItem(title="Двускатный навес для двора", place="Севастополь", price="от 315 000 ₽", image="/images/case-3.svg"),
]

REVIEWS = [
    ReviewItem(author="Алексей", city="Симферополь", rating=5, text="Сделали навес для двух машин за три дня, аккуратно покрасили каркас."),
    ReviewItem(author="Марина", city="Ялта", rating=5, text="Помогли подобрать поликарбонат под террасу и вывели водосток."),
    ReviewItem(author="Игорь", city="Севастополь", rating=5, text="Понравились подробная смета и монтаж без затягивания сроков."),
]

FAQ = [
    FaqItem(question="Выезжаете ли на замер?", answer="Да, согласуем удобное время и выезжаем на объект по Крыму."),
    FaqItem(question="Какая гарантия на навес?", answer="На конструкцию предоставляется гарантия до 7 лет в зависимости от проекта."),
    FaqItem(question="Можно ли заказать навес под ключ?", answer="Да, делаем проект, фундамент, каркас, кровлю, водосток и уборку площадки."),
]

SETTINGS = PublicSettings(
    company_name="Стальной Контур",
    phone="+7 978 000-44-88",
    whatsapp="https://wa.me/79780004488",
    cities=["Симферополь", "Севастополь", "Ялта", "Евпатория", "Алушта", "Феодосия", "Керч"],
    personal_data_consent_text="Нажимая кнопку отправки, вы соглашаетесь на обработку персональных данных.",
)
