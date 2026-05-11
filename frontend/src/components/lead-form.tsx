"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Upload } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type SubmitState = "idle" | "loading" | "success" | "error";
type LeadSource = "quiz" | "contact_form";

type UploadResponse = {
  url: string;
};

type QuizData = {
  canopyType: string;
  size: string;
  material: string;
  city: string;
  name: string;
  phone: string;
  comment: string;
};

type ContactFormData = {
  name: string;
  phone: string;
  city: string;
  comment: string;
};

const canopyOptions = [
  { label: "Для авто", value: "Навес для авто", multiplier: 1 },
  { label: "К дому / терраса", value: "Навес к дому", multiplier: 1.08 },
  { label: "Односкатный", value: "Односкатный навес", multiplier: 0.95 },
  { label: "Двускатный", value: "Двускатный навес", multiplier: 1.18 },
];

const sizeOptions = [
  { label: "3×4 м", value: "3×4 м", area: 12 },
  { label: "4×6 м", value: "4×6 м", area: 24 },
  { label: "6×6 м", value: "6×6 м", area: 36 },
  { label: "6×8 м", value: "6×8 м", area: 48 },
];

const materialOptions = [
  { label: "Поликарбонат", value: "Поликарбонат", pricePerMeter: 7600 },
  { label: "Профнастил", value: "Профнастил", pricePerMeter: 6900 },
  { label: "Металлочерепица", value: "Металлочерепица", pricePerMeter: 8400 },
  { label: "Мягкая кровля", value: "Мягкая кровля", pricePerMeter: 9200 },
];

const cityOptions = ["Симферополь", "Севастополь", "Ялта", "Евпатория", "Алушта", "Феодосия", "Керчь", "Другой город"];

const defaultQuizData: QuizData = {
  canopyType: canopyOptions[0].value,
  size: sizeOptions[1].value,
  material: materialOptions[0].value,
  city: cityOptions[0],
  name: "",
  phone: "",
  comment: "",
};

const defaultContactData: ContactFormData = {
  name: "",
  phone: "",
  city: "",
  comment: "",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0, style: "currency", currency: "RUB" }).format(value);
}

function getSourcePage() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

function getUtmMarks() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].reduce<Record<string, string>>((acc, key) => {
    const value = params.get(key);
    if (value) acc[key] = value;
    return acc;
  }, {});
}

async function uploadImage(photo: File) {
  if (!API_URL) {
    throw new Error("Не задан NEXT_PUBLIC_API_URL");
  }

  const formData = new FormData();
  formData.append("file", photo);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Не удалось загрузить фото");
  return response.json() as Promise<UploadResponse>;
}

async function postLead(payload: Record<string, unknown>) {
  if (!API_URL) {
    throw new Error("Не задан NEXT_PUBLIC_API_URL");
  }

  const response = await fetch(`${API_URL}/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Не удалось отправить заявку");
  return response.json();
}

function makePayload({ source, data, quiz, estimatedPrice, image }: { source: LeadSource; data: ContactFormData | QuizData; quiz?: QuizData; estimatedPrice?: number; image?: string | null }) {
  return {
    name: data.name,
    phone: data.phone,
    city: data.city,
    canopy_type: "canopyType" in data ? data.canopyType : quiz?.canopyType,
    material: "material" in data ? data.material : quiz?.material,
    size: "size" in data ? data.size : quiz?.size,
    comment: data.comment || (quiz ? `Квиз: размер ${quiz.size}, город ${quiz.city}` : undefined),
    image,
    source_page: getSourcePage(),
    utm: {
      ...getUtmMarks(),
      source,
      quiz_data: quiz,
      estimated_price: estimatedPrice,
    },
  };
}

function StatusMessage({ state, error }: { state: SubmitState; error: string }) {
  if (state === "success") {
    return <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">Заявка отправлена. Мы свяжемся с вами и подготовим точную смету.</p>;
  }

  if (state === "error") {
    return <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error || "Не удалось отправить заявку. Попробуйте еще раз или позвоните нам."}</p>;
  }

  return null;
}

function Consent({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="mt-4 flex items-start gap-3 rounded-2xl bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-border accent-copper-500"
        required
      />
      <span>Даю согласие на обработку персональных данных и получение ответа по заявке.</span>
    </label>
  );
}

export function QuizCalculator() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuizData>(defaultQuizData);
  const [photo, setPhoto] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");

  const steps = ["Тип навеса", "Размер", "Кровля", "Город", "Контакты"];
  const progress = ((step + 1) / steps.length) * 100;
  const estimatedPrice = useMemo(() => {
    const canopy = canopyOptions.find((item) => item.value === data.canopyType) ?? canopyOptions[0];
    const size = sizeOptions.find((item) => item.value === data.size) ?? sizeOptions[0];
    const material = materialOptions.find((item) => item.value === data.material) ?? materialOptions[0];
    return Math.round(size.area * material.pricePerMeter * canopy.multiplier);
  }, [data.canopyType, data.material, data.size]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) return;

    setState("loading");
    setError("");

    try {
      const uploadedPhoto = photo ? await uploadImage(photo) : null;
      await postLead(makePayload({ source: "quiz", data, quiz: data, estimatedPrice, image: uploadedPhoto?.url ?? null }));
      setState("success");
      setData(defaultQuizData);
      setPhoto(null);
      setStep(0);
      setConsent(false);
      event.currentTarget.reset();
    } catch (submitError) {
      setState("error");
      setError(submitError instanceof Error ? submitError.message : "Не удалось отправить заявку");
    }
  }

  return (
    <section id="quiz" className="section-padding bg-white">
      <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Badge>Квиз-калькулятор</Badge>
          <h2 className="section-title mt-4">Получите ориентировочную смету за 2 минуты</h2>
          <p className="section-lead">Ответьте на 5 шагов — менеджер уточнит детали, предложит материалы и пришлет точный расчет.</p>
          <div className="mt-6 rounded-[2rem] bg-steel-900 p-6 text-white">
            <p className="text-sm font-bold uppercase tracking-widest text-copper-400">Ориентировочная цена</p>
            <p className="mt-3 text-3xl font-black">от {formatPrice(estimatedPrice)}</p>
            <p className="mt-3 text-sm leading-6 text-white/65">Итоговая стоимость зависит от фундамента, высоты, окраски, водостока и условий монтажа.</p>
          </div>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm font-bold text-muted-foreground">
              <span>Шаг {step + 1} из {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-copper-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {steps.map((item, index) => (
                <span key={item} className={`rounded-full px-3 py-1 text-xs font-bold ${index <= step ? "bg-copper-100 text-copper-700" : "bg-muted text-muted-foreground"}`}>{item}</span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 0 && <OptionGrid title="Какой навес нужен?" options={canopyOptions} value={data.canopyType} onChange={(value) => setData((current) => ({ ...current, canopyType: value }))} />}
            {step === 1 && <OptionGrid title="Выберите примерный размер" options={sizeOptions} value={data.size} onChange={(value) => setData((current) => ({ ...current, size: value }))} />}
            {step === 2 && <OptionGrid title="Материал кровли" options={materialOptions} value={data.material} onChange={(value) => setData((current) => ({ ...current, material: value }))} />}
            {step === 3 && <OptionGrid title="Город монтажа" options={cityOptions.map((city) => ({ label: city, value: city }))} value={data.city} onChange={(value) => setData((current) => ({ ...current, city: value }))} />}
            {step === 4 && (
              <div>
                <h3 className="text-2xl font-black">Куда отправить точную смету?</h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <input required minLength={2} value={data.name} onChange={(event) => setData((current) => ({ ...current, name: event.target.value }))} className="rounded-2xl border px-4 py-3" placeholder="Ваше имя" />
                  <input required value={data.phone} onChange={(event) => setData((current) => ({ ...current, phone: event.target.value }))} className="rounded-2xl border px-4 py-3" placeholder="Телефон" type="tel" />
                </div>
                <textarea value={data.comment} onChange={(event) => setData((current) => ({ ...current, comment: event.target.value }))} className="mt-3 h-24 w-full rounded-2xl border px-4 py-3" placeholder="Комментарий: адрес, сроки, особенности участка" />
                <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed px-4 py-4 text-sm font-bold text-muted-foreground transition hover:border-copper-400">
                  <Upload className="h-5 w-5 text-copper-500" />
                  <span>{photo ? photo.name : "Загрузить фото участка"}</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
                </label>
                <Consent checked={consent} onChange={setConsent} />
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" disabled={step === 0 || state === "loading"} onClick={() => setStep((current) => Math.max(0, current - 1))} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" /> Назад
              </Button>
              {step < steps.length - 1 ? (
                <Button type="button" variant="copper" onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))} className="w-full sm:flex-1">
                  Далее <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" variant="copper" disabled={!consent || state === "loading"} className="w-full sm:flex-1">
                  {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Получить точную смету
                </Button>
              )}
            </div>
            <div className="mt-4"><StatusMessage state={state} error={error} /></div>
          </form>
        </Card>
      </div>
    </section>
  );
}

function OptionGrid({ title, options, value, onChange }: { title: string; options: Array<{ label: string; value: string }>; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <h3 className="text-2xl font-black">{title}</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className={`cursor-pointer rounded-3xl border p-4 transition ${value === option.value ? "border-copper-500 bg-copper-50" : "bg-muted/40 hover:border-copper-300"}`}>
            <input type="radio" name={title} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} className="sr-only" />
            <span className="font-bold">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function ContactLeadForm() {
  const [data, setData] = useState<ContactFormData>(defaultContactData);
  const [photo, setPhoto] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) return;

    setState("loading");
    setError("");

    try {
      const uploadedPhoto = photo ? await uploadImage(photo) : null;
      await postLead(makePayload({ source: "contact_form", data, image: uploadedPhoto?.url ?? null }));
      setState("success");
      setData(defaultContactData);
      setPhoto(null);
      setConsent(false);
      event.currentTarget.reset();
    } catch (submitError) {
      setState("error");
      setError(submitError instanceof Error ? submitError.message : "Не удалось отправить заявку");
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <input required minLength={2} value={data.name} onChange={(event) => setData((current) => ({ ...current, name: event.target.value }))} className="rounded-2xl border px-4 py-3" placeholder="Ваше имя" />
          <input required value={data.phone} onChange={(event) => setData((current) => ({ ...current, phone: event.target.value }))} className="rounded-2xl border px-4 py-3" placeholder="Телефон" type="tel" />
        </div>
        <input value={data.city} onChange={(event) => setData((current) => ({ ...current, city: event.target.value }))} className="mt-3 w-full rounded-2xl border px-4 py-3" placeholder="Город" />
        <textarea value={data.comment} onChange={(event) => setData((current) => ({ ...current, comment: event.target.value }))} className="mt-3 h-28 w-full rounded-2xl border px-4 py-3" placeholder="Комментарий: что нужно построить, размеры, сроки" />
        <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed px-4 py-4 text-sm font-bold text-muted-foreground transition hover:border-copper-400">
          <Upload className="h-5 w-5 text-copper-500" />
          <span>{photo ? photo.name : "Загрузить фото участка"}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
        </label>
        <Consent checked={consent} onChange={setConsent} />
        <Button type="submit" disabled={!consent || state === "loading"} className="mt-4 w-full" variant="copper">
          {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Отправить заявку
        </Button>
        <div className="mt-4"><StatusMessage state={state} error={error} /></div>
      </form>
    </Card>
  );
}
