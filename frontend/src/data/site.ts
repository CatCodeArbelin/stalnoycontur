import { Car, Factory, Home, MapPin, ShieldCheck, Sparkles, Timer, Wrench } from "lucide-react";

export const phone = "+7 978 000-44-88";
export const nav = [
  { href: "/", label: "Главная" },
  { href: "/cases", label: "Кейсы" },
  { href: "/navesy-dlya-avto", label: "Для авто" },
  { href: "/navesy-k-domu", label: "К дому" },
  { href: "/simferopol", label: "Города" },
];

export const advantages = [
  { icon: ShieldCheck, title: "Гарантия до 7 лет", text: "Собственное производство, контроль сварки и антикоррозийной подготовки." },
  { icon: Timer, title: "Монтаж от 2 дней", text: "Готовим проект, металл и поликарбонат заранее, без простоя на объекте." },
  { icon: Wrench, title: "Под ключ", text: "Замер, 3D-эскиз, фундамент, каркас, кровля, водосток и уборка площадки." },
  { icon: MapPin, title: "Весь Крым", text: "Работаем в Симферополе, Севастополе, Ялте, Евпатории, Алуште, Феодосии и Керчи." },
];

export const canopyTypes = [
  { href: "/navesy-dlya-avto", title: "Навесы для авто", image: "/images/canopy-auto.svg", icon: Car },
  { href: "/odnoskatnye-navesy", title: "Односкатные", image: "/images/canopy-single.svg", icon: Home },
  { href: "/dvuskatnye-navesy", title: "Двускатные", image: "/images/canopy-double.svg", icon: Home },
  { href: "/navesy-iz-polikarbonata", title: "Из поликарбоната", image: "/images/canopy-poly.svg", icon: Sparkles },
  { href: "/navesy-iz-profnastila", title: "Из профнастила", image: "/images/canopy-metal.svg", icon: Factory },
  { href: "/navesy-k-domu", title: "Навесы к дому", image: "/images/canopy-home.svg", icon: Home },
];

export const cases = [
  { title: "Навес 6×8 м для двух авто", place: "Симферополь", price: "от 268 000 ₽", image: "/images/case-1.svg" },
  { title: "Терраса с поликарбонатом", place: "Ялта", price: "от 184 000 ₽", image: "/images/case-2.svg" },
  { title: "Двускатный навес для двора", place: "Севастополь", price: "от 315 000 ₽", image: "/images/case-3.svg" },
];

export const cities = ["Симферополь", "Севастополь", "Ялта", "Евпатория", "Алушта", "Феодосия", "Керч"];

export const pageContent: Record<string, { title: string; description: string; badge: string; points: string[] }> = {
  "navesy-dlya-avto": {
    badge: "Для автомобиля",
    title: "Навесы для авто в Крыму",
    description: "Защищаем машину от солнца, града, соли и осадков. Рассчитываем высоту под внедорожник, два автомобиля или заезд с прицепом.",
    points: ["арочные, односкатные и двускатные конструкции", "поликарбонат 6–10 мм или профнастил", "организованный водосток и снеговые упоры"],
  },
  "odnoskatnye-navesy": {
    badge: "Практичная форма",
    title: "Односкатные навесы под ключ",
    description: "Компактное решение для примыкания к дому, гаражу или забору. Быстрый монтаж и предсказуемый водоотвод.",
    points: ["экономичный расход металла", "удобно для узких участков", "индивидуальный угол ската"],
  },
  "dvuskatnye-navesy": {
    badge: "Классика двора",
    title: "Двускатные навесы для дома и бизнеса",
    description: "Симметричная кровля выдерживает ветровые нагрузки и гармонично смотрится рядом с домами классической архитектуры.",
    points: ["усиленные фермы", "кровля профнастилом или металлочерепицей", "декоративные элементы и покраска RAL"],
  },
  "navesy-iz-polikarbonata": {
    badge: "Светлая кровля",
    title: "Навесы из поликарбоната",
    description: "Легкая светопропускающая кровля для парковки, террасы, бассейна и входной группы.",
    points: ["защита от UV", "цвета: бронза, графит, молочный, прозрачный", "термошайбы и герметизация торцов"],
  },
  "navesy-iz-profnastila": {
    badge: "Прочная кровля",
    title: "Навесы из профнастила",
    description: "Надежный вариант для хозяйственных зон, складов, больших парковок и участков с высокой ветровой нагрузкой.",
    points: ["профлист C20/C21/НС35", "минимальный шум за счет правильной обрешетки", "подбор цвета под фасад и забор"],
  },
  "navesy-k-domu": {
    badge: "Пристройка",
    title: "Навесы к дому и террасе",
    description: "Проектируем аккуратное примыкание к фасаду с водостоком, герметизацией и учетом отделки дома.",
    points: ["безопасное крепление к стене или на независимых стойках", "зона отдыха, кухня или парковка", "подсветка и декоративные стойки"],
  },
};

export const cityContent: Record<string, { title: string; description: string }> = {
  simferopol: { title: "Навесы в Симферополе", description: "Быстрый выезд замерщика по Симферополю и району, производство каркасов рядом с основными логистическими маршрутами." },
  sevastopol: { title: "Навесы в Севастополе", description: "Учитываем морской воздух и ветровые нагрузки, рекомендуем усиленную покраску и надежную кровлю." },
  yalta: { title: "Навесы в Ялте", description: "Проектируем конструкции для склонов, террас и сложного подъезда на Южном берегу Крыма." },
  evpatoriya: { title: "Навесы в Евпатории", description: "Делаем навесы для частных дворов, гостиниц, кафе и парковок в курортной зоне." },
  alushta: { title: "Навесы в Алуште", description: "Подбираем решения для компактных участков, перепадов высот и примыкания к дому." },
  feodosiya: { title: "Навесы в Феодосии", description: "Монтаж навесов для авто, дворов и коммерческих объектов с учетом прибрежного климата." },
  kerch: { title: "Навесы в Керчи", description: "Прочные каркасы и кровля для ветреных районов, доставка материалов на объект." },
};
