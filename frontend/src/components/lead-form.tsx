"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";

import { MotionReveal } from "@/components/motion-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getBrowserApiBase } from "@/lib/api-base";
import {
  fallbackCalculatorConfig,
  fallbackSettings,
  type CalculatorConfig,
  type PublicSettings,
} from "@/lib/content-api";

const API_URL = getBrowserApiBase();
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const CUSTOM_SIZE_VALUE = "custom_size";
const CUSTOM_SIZE_LABEL = "Свой размер";

type SubmitState = "idle" | "loading" | "success" | "error";
type LeadSource = "quiz" | "contact_form";

type QuizData = {
  canopyType: string;
  size: string;
  material: string;
  phone: string;
  comment: string;
  custom_area?: number;
};

type ContactFormData = {
  canopyType: string;
  size: string;
  phone: string;
  comment: string;
  custom_area?: number;
};

function getCalculatorConfig(
  settings?: Pick<PublicSettings, "calculator_config">,
): CalculatorConfig {
  return {
    canopyOptions: settings?.calculator_config?.canopyOptions?.length
      ? settings.calculator_config.canopyOptions
      : fallbackCalculatorConfig.canopyOptions,
    sizeOptions: settings?.calculator_config?.sizeOptions?.length
      ? settings.calculator_config.sizeOptions
      : fallbackCalculatorConfig.sizeOptions,
    materialOptions: settings?.calculator_config?.materialOptions?.length
      ? settings.calculator_config.materialOptions
      : fallbackCalculatorConfig.materialOptions,
    steps: settings?.calculator_config?.steps?.length
      ? settings.calculator_config.steps
      : fallbackCalculatorConfig.steps,
    allowCustomSize:
      settings?.calculator_config?.allowCustomSize ??
      fallbackCalculatorConfig.allowCustomSize,
  };
}

function makeDefaultQuizData(config = fallbackCalculatorConfig): QuizData {
  return {
    canopyType:
      config.canopyOptions[0]?.value ??
      fallbackCalculatorConfig.canopyOptions[0].value,
    size:
      config.sizeOptions[1]?.value ??
      config.sizeOptions[0]?.value ??
      fallbackCalculatorConfig.sizeOptions[1].value,
    material:
      config.materialOptions[0]?.value ??
      fallbackCalculatorConfig.materialOptions[0].value,
    phone: "",
    comment: "",
  };
}

function makeDefaultContactData(
  config = fallbackCalculatorConfig,
): ContactFormData {
  return {
    canopyType:
      config.canopyOptions[0]?.value ??
      fallbackCalculatorConfig.canopyOptions[0].value,
    size:
      config.sizeOptions[1]?.value ??
      config.sizeOptions[0]?.value ??
      fallbackCalculatorConfig.sizeOptions[1].value,
    phone: "",
    comment: "",
  };
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "RUB",
  }).format(value);
}

function formatFileSize(bytes: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(
    bytes / (1024 * 1024),
  );
}

function validatePhotoFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Недопустимый тип файла. Загрузите JPG, PNG или WEBP.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Файл слишком большой: ${formatFileSize(file.size)} МБ. Максимум — ${formatFileSize(MAX_IMAGE_SIZE_BYTES)} МБ.`;
  }

  return "";
}

function parseCustomArea(value: string) {
  const normalized = Number(value.replace(",", "."));
  return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
}

function formatArea(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(
    value,
  );
}

function getReadableSize(
  data: Pick<ContactFormData | QuizData, "size" | "custom_area">,
) {
  if (data.size !== CUSTOM_SIZE_VALUE || !data.custom_area) {
    return data.size;
  }

  return `Свой размер: ${formatArea(data.custom_area)} м²`;
}

function getQuizSizePayload(data: QuizData) {
  return {
    ...data,
    size: getReadableSize(data),
  };
}

function getSourcePage() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

function getUtmMarks() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ].reduce<Record<string, string>>((acc, key) => {
    const value = params.get(key);
    if (value) acc[key] = value;
    return acc;
  }, {});
}

async function postLead(payload: Record<string, unknown>, photo?: File | null) {
  if (photo) {
    const validationError = validatePhotoFile(photo);
    if (validationError) throw new Error(validationError);
  }

  const formData = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    formData.append(
      key,
      typeof value === "object"
        ? JSON.stringify(value ?? null)
        : String(value ?? ""),
    );
  }

  if (photo) {
    formData.append("file", photo);
  }

  const response = await fetch(`${API_URL}/lead`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Не удалось отправить заявку");
  return response.json();
}

function makePayload({
  source,
  data,
  quiz,
  estimatedPrice,
}: {
  source: LeadSource;
  data: ContactFormData | QuizData;
  quiz?: QuizData;
  estimatedPrice?: number;
}) {
  return {
    name: "",
    phone: data.phone,
    city: "",
    canopy_type: "canopyType" in data ? data.canopyType : quiz?.canopyType,
    material: "material" in data ? data.material : quiz?.material,
    size:
      "size" in data
        ? getReadableSize(data)
        : quiz
          ? getReadableSize(quiz)
          : undefined,
    comment: data.comment || (quiz ? `Квиз: размер ${quiz.size}` : ""),
    source_page: getSourcePage(),
    utm: {
      ...getUtmMarks(),
      source,
      quiz_data: quiz,
      estimated_price: estimatedPrice,
    },
  };
}

function StatusMessage({
  state,
  error,
}: {
  state: SubmitState;
  error: string;
}) {
  if (state === "success") {
    return (
      <p className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
        Заявка отправлена. Мы свяжемся с вами и подготовим точную смету.
      </p>
    );
  }

  if (state === "error") {
    return (
      <p className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-300">
        {error ||
          "Не удалось отправить заявку. Попробуйте еще раз или позвоните нам."}
      </p>
    );
  }

  return null;
}

function PhotoPicker({
  photo,
  onPhotoChange,
  error,
  onErrorChange,
}: {
  photo: File | null;
  onPhotoChange: (photo: File | null) => void;
  error: string;
  onErrorChange: (error: string) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photo) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(photo);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  function handleChange(file: File | null) {
    if (!file) {
      onPhotoChange(null);
      onErrorChange("");
      return;
    }

    const validationError = validatePhotoFile(file);
    if (validationError) {
      onPhotoChange(null);
      onErrorChange(validationError);
      return;
    }

    onPhotoChange(file);
    onErrorChange("");
  }

  return (
    <div className="mt-3">
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed px-4 py-4 text-sm font-bold text-muted-foreground transition hover:border-copper-400">
        <Upload className="h-5 w-5 text-copper-500" />
        <span>{photo ? photo.name : "Загрузить фото участка"}</span>
        <input
          type="file"
          accept={IMAGE_ACCEPT}
          className="sr-only"
          onChange={(event) => {
            handleChange(event.target.files?.[0] ?? null);
            event.currentTarget.value = "";
          }}
        />
      </label>
      <p className="mt-2 text-xs text-muted-foreground">
        JPG, PNG или WEBP до {formatFileSize(MAX_IMAGE_SIZE_BYTES)} МБ. После
        загрузки изображение будет оптимизировано в WEBP.
      </p>
      {error ? (
        <p className="mt-2 rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
      {previewUrl ? (
        <div className="mt-3 overflow-hidden rounded-2xl border bg-muted/40">
          <Image
            src={previewUrl}
            alt="Предпросмотр выбранного фото"
            width={640}
            height={360}
            unoptimized
            className="max-h-64 w-full object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}

function Consent({
  checked,
  onChange,
  text,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  text: string;
}) {
  return (
    <label className="mt-4 flex items-start gap-3 rounded-2xl bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-border accent-copper-500"
        required
      />
      <span>{text}</span>
    </label>
  );
}

export function QuizCalculator({
  settings = fallbackSettings,
}: {
  settings?: Pick<
    PublicSettings,
    "personal_data_consent_text" | "calculator_config"
  >;
}) {
  const calculatorConfig = getCalculatorConfig(settings);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuizData>(() =>
    makeDefaultQuizData(calculatorConfig),
  );
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [customArea, setCustomArea] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");
  const consentText =
    settings.personal_data_consent_text ||
    fallbackSettings.personal_data_consent_text;
  const { allowCustomSize, canopyOptions, materialOptions, sizeOptions, steps } =
    calculatorConfig;
  const selectedCustomArea = parseCustomArea(customArea);
  const quizSizeOptions = useMemo(
    () =>
      allowCustomSize
        ? [
            ...sizeOptions,
            { label: CUSTOM_SIZE_LABEL, value: CUSTOM_SIZE_VALUE },
          ]
        : sizeOptions,
    [allowCustomSize, sizeOptions],
  );

  useEffect(() => {
    setData((current) => ({
      ...current,
      canopyType: canopyOptions.some(
        (item) => item.value === current.canopyType,
      )
        ? current.canopyType
        : canopyOptions[0].value,
      size:
        sizeOptions.some((item) => item.value === current.size) ||
        (allowCustomSize && current.size === CUSTOM_SIZE_VALUE)
          ? current.size
          : sizeOptions[0].value,
      material: materialOptions.some((item) => item.value === current.material)
        ? current.material
        : materialOptions[0].value,
    }));
  }, [allowCustomSize, canopyOptions, materialOptions, sizeOptions]);

  const progress = ((step + 1) / steps.length) * 100;
  const estimatedPrice = useMemo(() => {
    const canopy =
      canopyOptions.find((item) => item.value === data.canopyType) ??
      canopyOptions[0];
    const sizeArea =
      data.size === CUSTOM_SIZE_VALUE && selectedCustomArea
        ? selectedCustomArea
        : (
            sizeOptions.find((item) => item.value === data.size) ??
            sizeOptions[0]
          ).area;
    const material =
      materialOptions.find((item) => item.value === data.material) ??
      materialOptions[0];
    return Math.round(sizeArea * material.pricePerMeter * canopy.multiplier);
  }, [
    canopyOptions,
    data.canopyType,
    data.material,
    data.size,
    materialOptions,
    selectedCustomArea,
    sizeOptions,
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) return;

    setState("loading");
    setError("");

    try {
      const submittedData = getQuizSizePayload({
        ...data,
        custom_area:
          data.size === CUSTOM_SIZE_VALUE && selectedCustomArea
            ? selectedCustomArea
            : undefined,
      });
      await postLead(
        makePayload({
          source: "quiz",
          data: submittedData,
          quiz: submittedData,
          estimatedPrice,
        }),
        photo,
      );
      setState("success");
      setData(makeDefaultQuizData(calculatorConfig));
      setPhoto(null);
      setPhotoError("");
      setCustomArea("");
      setStep(0);
      setConsent(false);
      event.currentTarget.reset();
    } catch (submitError) {
      setState("error");
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось отправить заявку",
      );
    }
  }

  return (
    <section id="quiz" className="section-padding bg-card">
      <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <MotionReveal delay={0.05} direction="right">
          <Badge>Квиз-калькулятор</Badge>
          <h2 className="section-title mt-4">
            Получите ориентировочную смету за 2 минуты
          </h2>
          <p className="section-lead">
            Выберите тип и размер, оставьте телефон — менеджер быстро уточнит
            детали и пришлет расчет.
          </p>
          <div className="mt-6 rounded-[2rem] bg-steel-900 p-6 text-white">
            <p className="text-sm font-bold uppercase tracking-widest text-copper-400">
              Ориентировочная цена
            </p>
            <p className="mt-3 text-3xl font-black">
              от {formatPrice(estimatedPrice)}
            </p>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Итоговая стоимость зависит от фундамента, высоты, окраски,
              водостока и условий монтажа.
            </p>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.16} direction="left">
          <Card className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm font-bold text-muted-foreground">
                <span>
                  Шаг {step + 1} из {steps.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-copper-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {steps.map((item, index) => (
                  <span
                    key={item.id}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${index <= step ? "bg-copper-500/15 text-copper-600 dark:text-copper-300" : "bg-muted text-muted-foreground"}`}
                  >
                    {item.title}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {step === 0 && (
                <OptionGrid
                  title={steps[0]?.title || "Какой навес нужен?"}
                  options={canopyOptions}
                  value={data.canopyType}
                  onChange={(value) =>
                    setData((current) => ({ ...current, canopyType: value }))
                  }
                />
              )}
              {step === 1 && (
                <OptionGrid
                  title={steps[1]?.title || "Выберите покрытие крыши"}
                  options={materialOptions}
                  value={data.material}
                  onChange={(value) =>
                    setData((current) => ({ ...current, material: value }))
                  }
                />
              )}
              {step === 2 && (
                <OptionGrid
                  title={steps[2]?.title || "Выберите примерный размер"}
                  options={quizSizeOptions}
                  value={data.size}
                  onChange={(value) =>
                    setData((current) => ({ ...current, size: value }))
                  }
                >
                  {data.size === CUSTOM_SIZE_VALUE ? (
                    <label className="mt-5 grid gap-2 text-sm font-bold text-foreground">
                      Площадь, м²
                      <input
                        required
                        min="0.01"
                        step="0.01"
                        type="number"
                        inputMode="decimal"
                        value={customArea}
                        onChange={(event) => setCustomArea(event.target.value)}
                        className="rounded-2xl border bg-background px-4 py-3 font-normal text-foreground placeholder:text-muted-foreground"
                        placeholder="Например, 37"
                      />
                    </label>
                  ) : null}
                </OptionGrid>
              )}
              {step === 3 && (
                <div>
                  <h3 className="text-2xl font-black">
                    {steps[3]?.title || "Куда отправить точную смету?"}
                  </h3>
                  <input
                    required
                    value={data.phone}
                    onChange={(event) =>
                      setData((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    className="mt-5 w-full rounded-2xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground"
                    placeholder="Телефон"
                    type="tel"
                  />
                  <textarea
                    value={data.comment}
                    onChange={(event) =>
                      setData((current) => ({
                        ...current,
                        comment: event.target.value,
                      }))
                    }
                    className="mt-3 h-24 w-full rounded-2xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground"
                    placeholder="Комментарий или адрес участка (необязательно)"
                  />
                  <PhotoPicker
                    photo={photo}
                    onPhotoChange={setPhoto}
                    error={photoError}
                    onErrorChange={setPhotoError}
                  />
                  <Consent
                    checked={consent}
                    onChange={setConsent}
                    text={consentText}
                  />
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  disabled={step === 0 || state === "loading"}
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" /> Назад
                </Button>
                {step < steps.length - 1 ? (
                  <Button
                    type="button"
                    variant="copper"
                    disabled={
                      state === "loading" ||
                      (step === 1 &&
                        data.size === CUSTOM_SIZE_VALUE &&
                        !selectedCustomArea)
                    }
                    onClick={() =>
                      setStep((current) =>
                        Math.min(steps.length - 1, current + 1),
                      )
                    }
                    className="w-full sm:flex-1"
                  >
                    Далее <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="copper"
                    disabled={!consent || state === "loading"}
                    className="w-full sm:flex-1"
                  >
                    {state === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Получить точную смету
                  </Button>
                )}
              </div>
              <div className="mt-4">
                <StatusMessage state={state} error={error} />
              </div>
            </form>
          </Card>
        </MotionReveal>
      </div>
    </section>
  );
}

function OptionGrid({
  title,
  options,
  value,
  onChange,
  children,
}: {
  title: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
  children?: ReactNode;
}) {
  return (
    <div>
      <h3 className="text-2xl font-black">{title}</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`cursor-pointer rounded-3xl border p-4 transition ${value === option.value ? "border-copper-500 bg-copper-500/15 text-foreground" : "bg-muted/40 hover:border-copper-300"}`}
          >
            <input
              type="radio"
              name={title}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span className="font-bold">{option.label}</span>
          </label>
        ))}
      </div>
      {children}
    </div>
  );
}

export function ContactLeadForm({
  settings = fallbackSettings,
}: {
  settings?: Pick<
    PublicSettings,
    "personal_data_consent_text" | "calculator_config"
  >;
}) {
  const calculatorConfig = getCalculatorConfig(settings);
  const { allowCustomSize, canopyOptions, sizeOptions } = calculatorConfig;
  const [data, setData] = useState<ContactFormData>(() =>
    makeDefaultContactData(calculatorConfig),
  );
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [customArea, setCustomArea] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");
  const consentText =
    settings.personal_data_consent_text ||
    fallbackSettings.personal_data_consent_text;
  const selectedCustomArea = parseCustomArea(customArea);
  const contactSizeOptions = useMemo(
    () =>
      allowCustomSize
        ? [
            ...sizeOptions,
            { label: CUSTOM_SIZE_LABEL, value: CUSTOM_SIZE_VALUE },
          ]
        : sizeOptions,
    [allowCustomSize, sizeOptions],
  );

  useEffect(() => {
    setData((current) => ({
      ...current,
      canopyType: canopyOptions.some(
        (item) => item.value === current.canopyType,
      )
        ? current.canopyType
        : canopyOptions[0].value,
      size:
        sizeOptions.some((item) => item.value === current.size) ||
        (allowCustomSize && current.size === CUSTOM_SIZE_VALUE)
          ? current.size
          : sizeOptions[0].value,
    }));
  }, [allowCustomSize, canopyOptions, sizeOptions]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) return;

    setState("loading");
    setError("");

    try {
      const submittedData: ContactFormData = {
        ...data,
        custom_area:
          data.size === CUSTOM_SIZE_VALUE && selectedCustomArea
            ? selectedCustomArea
            : undefined,
      };
      await postLead(
        makePayload({ source: "contact_form", data: submittedData }),
        photo,
      );
      setState("success");
      setData(makeDefaultContactData(calculatorConfig));
      setPhoto(null);
      setPhotoError("");
      setCustomArea("");
      setConsent(false);
      event.currentTarget.reset();
    } catch (submitError) {
      setState("error");
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось отправить заявку",
      );
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            value={data.phone}
            onChange={(event) =>
              setData((current) => ({ ...current, phone: event.target.value }))
            }
            className="rounded-2xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground"
            placeholder="Телефон"
            type="tel"
          />
          <select
            required
            value={data.canopyType}
            onChange={(event) =>
              setData((current) => ({
                ...current,
                canopyType: event.target.value,
              }))
            }
            className="rounded-2xl border bg-background px-4 py-3 text-foreground"
          >
            {canopyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <select
          required
          value={data.size}
          onChange={(event) =>
            setData((current) => ({ ...current, size: event.target.value }))
          }
          className="mt-3 w-full rounded-2xl border bg-background px-4 py-3 text-foreground"
        >
          {contactSizeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {data.size === CUSTOM_SIZE_VALUE ? (
          <label className="mt-3 grid gap-2 text-sm font-bold text-foreground">
            Площадь, м²
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              inputMode="decimal"
              value={customArea}
              onChange={(event) => setCustomArea(event.target.value)}
              className="rounded-2xl border bg-background px-4 py-3 font-normal text-foreground placeholder:text-muted-foreground"
              placeholder="Например, 42"
            />
          </label>
        ) : null}
        <textarea
          value={data.comment}
          onChange={(event) =>
            setData((current) => ({ ...current, comment: event.target.value }))
          }
          className="mt-3 h-28 w-full rounded-2xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground"
          placeholder="Размеры, адрес или комментарий (можно заменить фото)"
        />
        <PhotoPicker
          photo={photo}
          onPhotoChange={setPhoto}
          error={photoError}
          onErrorChange={setPhotoError}
        />
        <Consent checked={consent} onChange={setConsent} text={consentText} />
        <Button
          type="submit"
          disabled={!consent || state === "loading"}
          className="mt-4 w-full"
          variant="copper"
        >
          {state === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Отправить заявку
        </Button>
        <div className="mt-4">
          <StatusMessage state={state} error={error} />
        </div>
      </form>
    </Card>
  );
}
