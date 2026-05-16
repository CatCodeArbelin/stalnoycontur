"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import {
  AdminCrudPanel,
  adminNav,
  type UploadCategory,
} from "@/components/admin/admin-shell";
import { casesResource } from "@/components/admin/resource-configs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBrowserApiBase } from "@/lib/api-base";
import { fallbackCalculatorConfig, type CalculatorConfig } from "@/lib/content-api";
import { cn } from "@/lib/utils";

type MessageType = "success" | "error";
type SettingsTab = "contacts" | "calculator" | "cases" | "images";

type AdminSetting = {
  id: number;
  key: string;
  value: unknown;
  description?: string | null;
  updated_at?: string | null;
};

type PhoneRow = {
  label: string;
  href: string;
};

type SiteSettingsFormState = {
  company_name: string;
  phone: string;
  phones: PhoneRow[];
  telegram: string;
  max: string;
  avito: string;
  personal_data_consent_text: string;
  calculator_config: CalculatorConfig;
};

type SiteSettingsKey = keyof SiteSettingsFormState;
type CalculatorOptionGroup = keyof CalculatorConfig;

type SiteSettingsField = {
  key: SiteSettingsKey;
  description: string;
};

type UploadItem = {
  id: number;
  filename: string;
  url: string;
  content_type: string;
  size_bytes: number;
};

const siteSettingsFields: SiteSettingsField[] = [
  { key: "company_name", description: "Название компании на публичном сайте" },
  { key: "phone", description: "Основной телефон в текстовом виде" },
  {
    key: "phones",
    description: "Список телефонов для шапки, футера и быстрых контактов",
  },
  { key: "telegram", description: "Ссылка на Telegram" },
  { key: "max", description: "Ссылка на MAX" },
  { key: "avito", description: "Ссылка на Avito" },
  {
    key: "personal_data_consent_text",
    description: "Текст согласия на обработку персональных данных",
  },
  {
    key: "calculator_config",
    description: "Настройки квиз-калькулятора: типы, размеры, материалы, коэффициенты и цены",
  },
];

const emptyForm: SiteSettingsFormState = {
  company_name: "",
  phone: "",
  phones: [],
  telegram: "",
  max: "",
  avito: "",
  personal_data_consent_text: "",
  calculator_config: fallbackCalculatorConfig,
};

const apiBase = getBrowserApiBase();
const uploadCategories: { value: UploadCategory; label: string }[] = [
  { value: "uploads", label: "Общие" },
  { value: "cases", label: "Кейсы" },
  { value: "gallery", label: "Галерея" },
  { value: "production", label: "Производство" },
];

const dashboardTabs: {
  key: SettingsTab;
  title: string;
  description: string;
}[] = [
  {
    key: "contacts",
    title: "Контакты",
    description: "Телефоны, Telegram, MAX, Avito и название компании",
  },
  {
    key: "calculator",
    title: "Калькулятор",
    description: "Типы навесов, размеры, материалы и цены",
  },
  {
    key: "cases",
    title: "Кейсы / работы",
    description: "CRUD выполненных работ",
  },
  {
    key: "images",
    title: "Изображения",
    description: "Загрузка и список файлов по категориям",
  },
];

function detailToMessage(detail: unknown) {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item)
          return String(item.msg);
        return JSON.stringify(item);
      })
      .filter(Boolean);
    return messages.join("; ");
  }
  if (detail && typeof detail === "object") return JSON.stringify(detail);
  return "";
}

async function formatApiError(error: unknown) {
  if (error instanceof Response) {
    const fallback = error.statusText || "Ошибка запроса";
    const text = await error.text();
    if (!text) return fallback;

    try {
      const data = JSON.parse(text) as {
        detail?: unknown;
        message?: unknown;
        error?: unknown;
      };
      return (
        detailToMessage(data.detail ?? data.message ?? data.error) || fallback
      );
    } catch {
      const contentType =
        error.headers.get("Content-Type")?.toLowerCase() ?? "";
      if (contentType.includes("text/html")) {
        const message =
          "API недоступен или настроен неверно: получена HTML-страница вместо JSON";
        if (error.status === 404)
          return `${message}. Проверьте proxy/rewrite для /api/*.`;
        return message;
      }

      return text;
    }
  }

  if (error instanceof Error) return error.message || "Ошибка запроса";
  if (typeof error === "string") return error;
  return "Ошибка запроса";
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizePhones(value: unknown): PhoneRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item),
    )
    .map((item) => ({
      label: normalizeString(item.label),
      href: normalizeString(item.href),
    }))
    .filter((item) => item.label || item.href);
}

function normalizePositiveNumber(value: unknown, fallback: number) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
}

function normalizeCalculatorConfig(value: unknown): CalculatorConfig {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return fallbackCalculatorConfig;

  const source = value as Partial<Record<CalculatorOptionGroup, unknown>>;
  return {
    canopyOptions: normalizeCalculatorOptions(
      source.canopyOptions,
      fallbackCalculatorConfig.canopyOptions,
      "multiplier",
    ),
    sizeOptions: normalizeCalculatorOptions(
      source.sizeOptions,
      fallbackCalculatorConfig.sizeOptions,
      "area",
    ),
    materialOptions: normalizeCalculatorOptions(
      source.materialOptions,
      fallbackCalculatorConfig.materialOptions,
      "pricePerMeter",
    ),
  };
}

function normalizeCalculatorOptions<Metric extends "multiplier" | "area" | "pricePerMeter">(
  value: unknown,
  fallback: Array<{ label: string; value: string } & Record<Metric, number>>,
  metric: Metric,
) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item),
    )
    .map((item, index) => ({
      label: normalizeString(item.label),
      value: normalizeString(item.value),
      [metric]: normalizePositiveNumber(item[metric], fallback[index]?.[metric] ?? 1),
    }))
    .filter((item) => item.label && item.value);
  return (normalized.length ? normalized : fallback) as Array<
    { label: string; value: string } & Record<Metric, number>
  >;
}

function settingValueToFormValue(key: SiteSettingsKey, value: unknown) {
  if (key === "phones") return normalizePhones(value);
  if (key === "calculator_config") return normalizeCalculatorConfig(value);
  return normalizeString(value);
}

function formValueToSettingValue(
  key: SiteSettingsKey,
  form: SiteSettingsFormState,
) {
  if (key === "phones") {
    return form.phones
      .map((item) => ({ label: item.label.trim(), href: item.href.trim() }))
      .filter((item) => item.label || item.href);
  }
  if (key === "calculator_config") {
    return {
      canopyOptions: form.calculator_config.canopyOptions
        .map((item) => ({
          label: item.label.trim(),
          value: item.value.trim(),
          multiplier: item.multiplier,
        }))
        .filter((item) => item.label && item.value),
      sizeOptions: form.calculator_config.sizeOptions
        .map((item) => ({
          label: item.label.trim(),
          value: item.value.trim(),
          area: item.area,
        }))
        .filter((item) => item.label && item.value),
      materialOptions: form.calculator_config.materialOptions
        .map((item) => ({
          label: item.label.trim(),
          value: item.value.trim(),
          pricePerMeter: item.pricePerMeter,
        }))
        .filter((item) => item.label && item.value),
    };
  }
  return String(form[key] ?? "").trim();
}

export function SiteSettingsForm() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [form, setForm] = useState<SiteSettingsFormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("success");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("contacts");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [uploadCategory, setUploadCategory] =
    useState<UploadCategory>("uploads");

  function showMessage(text: string, type: MessageType = "success") {
    setMessage(text);
    setMessageType(type);
  }

  async function logout(messageText?: string) {
    setIsAuthenticated(false);
    setCsrfToken("");
    setSettings([]);
    setForm(emptyForm);
    try {
      await fetch(`${apiBase}/admin/auth/logout`, {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      // Local logout must still complete even if the session already expired.
    }
    if (messageText) showMessage(messageText, "error");
  }

  async function request(path: string, init: RequestInit = {}) {
    const method = (init.method ?? "GET").toUpperCase();
    const headers = new Headers(init.headers);
    if (!(init.body instanceof FormData) && !headers.has("Content-Type"))
      headers.set("Content-Type", "application/json");
    if (csrfToken && ["POST", "PATCH", "DELETE"].includes(method))
      headers.set("X-CSRF-Token", csrfToken);

    const response = await fetch(`${apiBase}${path}`, {
      ...init,
      credentials: "same-origin",
      headers,
    });
    if (!response.ok) {
      const isSessionError = response.status === 401 || response.status === 403;
      const isLoginRequest = path === "/admin/auth/login";
      const errorMessage =
        isSessionError && !isLoginRequest
          ? "Сессия истекла, войдите снова"
          : await formatApiError(response);

      if (isSessionError && !isLoginRequest && isAuthenticated)
        void logout(errorMessage);

      throw new Error(errorMessage);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const data = await request("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setCsrfToken(data.csrf_token);
      setIsAuthenticated(true);
      showMessage("Вход выполнен");
    } catch (error) {
      showMessage(await formatApiError(error), "error");
    }
  }

  function applySettings(items: AdminSetting[]) {
    const nextForm = { ...emptyForm };
    for (const field of siteSettingsFields) {
      const setting = items.find((item) => item.key === field.key);
      if (setting)
        nextForm[field.key] = settingValueToFormValue(
          field.key,
          setting.value,
        ) as never;
    }
    setSettings(items);
    setForm(nextForm);
  }

  async function loadSettings() {
    if (!isAuthenticated) return;
    try {
      const data = (await request("/admin/settings")) as AdminSetting[];
      applySettings(data);
    } catch (error) {
      showMessage(await formatApiError(error), "error");
    }
  }

  async function loadUploads() {
    if (!isAuthenticated) return;
    try {
      const data = (await request("/admin/uploads")) as UploadItem[];
      setUploads(data);
    } catch (error) {
      showMessage(await formatApiError(error), "error");
    }
  }

  async function uploadStandaloneImage(file: File | null) {
    if (!file) return;
    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("category", uploadCategory);
      await request("/admin/upload", { method: "POST", body: payload });
      showMessage("Изображение загружено");
      await loadUploads();
    } catch (error) {
      showMessage(await formatApiError(error), "error");
    } finally {
      setIsSaving(false);
    }
  }

  function inferUploadCategory(url: string) {
    return (
      uploadCategories.find((category) =>
        url.includes(`/images/${category.value}/`),
      )?.value ?? "uploads"
    );
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      for (const field of siteSettingsFields) {
        const existing = settings.find((item) => item.key === field.key);
        const body = JSON.stringify({
          key: field.key,
          value: formValueToSettingValue(field.key, form),
          description: existing?.description || field.description,
        });
        await request(
          existing ? `/admin/settings/${existing.id}` : "/admin/settings",
          { method: existing ? "PATCH" : "POST", body },
        );
      }
      showMessage("Основные настройки сайта сохранены");
      await loadSettings();
    } catch (error) {
      showMessage(await formatApiError(error), "error");
    } finally {
      setIsSaving(false);
    }
  }

  function updatePhone(index: number, key: keyof PhoneRow, value: string) {
    setForm((current) => ({
      ...current,
      phones: current.phones.map((phone, phoneIndex) =>
        phoneIndex === index ? { ...phone, [key]: value } : phone,
      ),
    }));
  }

  function addPhone() {
    setForm((current) => ({
      ...current,
      phones: [...current.phones, { label: "", href: "" }],
    }));
  }

  function removePhone(index: number) {
    setForm((current) => ({
      ...current,
      phones: current.phones.filter((_, phoneIndex) => phoneIndex !== index),
    }));
  }

  function updateCalculatorOption(
    group: CalculatorOptionGroup,
    index: number,
    key: "label" | "value" | "multiplier" | "area" | "pricePerMeter",
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      calculator_config: {
        ...current.calculator_config,
        [group]: current.calculator_config[group].map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [key]: key === "label" || key === "value" ? value : Number(value),
              }
            : item,
        ),
      },
    }));
  }

  function addCalculatorOption(group: CalculatorOptionGroup) {
    setForm((current) => {
      const fallbackItem = fallbackCalculatorConfig[group][0];
      return {
        ...current,
        calculator_config: {
          ...current.calculator_config,
          [group]: [
            ...current.calculator_config[group],
            { ...fallbackItem, label: "", value: "" },
          ],
        },
      };
    });
  }

  function removeCalculatorOption(group: CalculatorOptionGroup, index: number) {
    setForm((current) => ({
      ...current,
      calculator_config: {
        ...current.calculator_config,
        [group]: current.calculator_config[group].filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      },
    }));
  }

  function renderCalculatorGroup(
    group: CalculatorOptionGroup,
    title: string,
    metricKey: "multiplier" | "area" | "pricePerMeter",
    metricLabel: string,
    metricStep = "1",
  ) {
    return (
      <div className="grid gap-3 rounded-2xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-steel-700">{title}</p>
            <p className="text-xs text-steel-500">
              Label видит пользователь, value уходит в заявку.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addCalculatorOption(group)}
          >
            Добавить
          </Button>
        </div>
        <div className="grid gap-3">
          {form.calculator_config[group].map((option, index) => (
            <div
              className="grid gap-2 rounded-2xl bg-slate-100 p-3 md:grid-cols-[1fr_1fr_160px_auto]"
              key={`${group}-${index}`}
            >
              <input
                className="rounded-2xl border p-3"
                value={option.label}
                onChange={(event) =>
                  updateCalculatorOption(group, index, "label", event.target.value)
                }
                placeholder="Label"
              />
              <input
                className="rounded-2xl border p-3"
                value={option.value}
                onChange={(event) =>
                  updateCalculatorOption(group, index, "value", event.target.value)
                }
                placeholder="Value"
              />
              <label className="grid gap-1 text-xs font-semibold text-steel-600">
                {metricLabel}
                <input
                  className="rounded-2xl border p-3 font-normal"
                  min="0.01"
                  step={metricStep}
                  type="number"
                  value={String(option[metricKey as keyof typeof option] ?? "")}
                  onChange={(event) =>
                    updateCalculatorOption(
                      group,
                      index,
                      metricKey,
                      event.target.value,
                    )
                  }
                />
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={() => removeCalculatorOption(group, index)}
              >
                Удалить
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  useEffect(() => {
    async function restoreSession() {
      const response = await fetch(`${apiBase}/admin/auth/csrf`, {
        credentials: "same-origin",
      });
      if (!response.ok) {
        setIsAuthenticated(false);
        setCsrfToken("");
        return;
      }
      const data = await response.json();
      setCsrfToken(data.csrf_token);
      setIsAuthenticated(true);
    }

    void restoreSession();
  }, []);

  useEffect(() => {
    void loadSettings();
    void loadUploads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <section className="bg-slate-50 py-10">
      <div className="container grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper-600">
              Admin
            </p>
            <h1 className="text-3xl font-black text-steel-950 md:text-4xl">
              Основные настройки сайта
            </h1>
            <p className="mt-2 max-w-3xl text-steel-600">
              Управление публичными контактами, городами и текстом согласия без
              ручного ввода системных ключей.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {adminNav.map(([href, label]) => (
              <Button key={href} asChild variant="outline" size="sm">
                <Link href={href}>{label}</Link>
              </Button>
            ))}
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={() => void logout()}>
                Выйти
              </Button>
            ) : null}
          </div>
        </div>

        {!isAuthenticated ? (
          <Card>
            <CardHeader>
              <CardTitle>Вход администратора</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-3" onSubmit={login}>
                <input
                  className="rounded-2xl border p-3"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Логин"
                />
                <input
                  className="rounded-2xl border p-3"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Пароль"
                  type="password"
                />
                <Button type="submit">Войти</Button>
              </form>
              {process.env.NODE_ENV === "development" ? (
                <p className="mt-3 text-xs text-steel-500">
                  dev default: admin / change-me
                </p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {message ? (
          <div
            className={cn(
              "rounded-2xl p-4 text-sm font-semibold",
              messageType === "error"
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-700",
            )}
          >
            {message}
          </div>
        ) : null}

        {isAuthenticated ? (
          <div className="grid gap-6">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {dashboardTabs.map((tab) => (
                <button
                  className={cn(
                    "rounded-2xl border bg-white p-4 text-left transition hover:border-copper-300 hover:shadow-sm",
                    activeTab === tab.key && "border-copper-500 bg-copper-50",
                  )}
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  type="button"
                >
                  <span className="text-base font-black text-steel-950">
                    {tab.title}
                  </span>
                  <span className="mt-1 block text-sm text-steel-600">
                    {tab.description}
                  </span>
                </button>
              ))}
            </div>

            {activeTab === "contacts" ? (
              <Card>
                <CardHeader className="flex-row items-center justify-between gap-4">
                  <CardTitle>Контакты</CardTitle>
                  <Button variant="outline" size="sm" onClick={loadSettings}>
                    Обновить
                  </Button>
                </CardHeader>
                <CardContent>
                  <form className="grid gap-5" onSubmit={saveSettings}>
                    <label className="grid gap-1 text-sm font-semibold text-steel-700">
                      Название компании
                      <input
                        className="rounded-2xl border p-3 font-normal"
                        value={form.company_name}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            company_name: event.target.value,
                          }))
                        }
                        placeholder="Стальной Контур"
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-semibold text-steel-700">
                      Основной телефон
                      <input
                        className="rounded-2xl border p-3 font-normal"
                        value={form.phone}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                        placeholder="+7 (978) 000-00-00"
                      />
                    </label>

                    <div className="grid gap-3 rounded-2xl border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-steel-700">
                            Список телефонов
                          </p>
                          <p className="text-xs text-steel-500">
                            Label отображается на сайте, href используется в
                            ссылке tel:.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addPhone}
                        >
                          Добавить телефон
                        </Button>
                      </div>
                      <div className="grid gap-3">
                        {form.phones.map((phone, index) => (
                          <div
                            className="grid gap-2 rounded-2xl bg-slate-100 p-3 md:grid-cols-[1fr_1fr_auto]"
                            key={index}
                          >
                            <input
                              className="rounded-2xl border p-3"
                              value={phone.label}
                              onChange={(event) =>
                                updatePhone(index, "label", event.target.value)
                              }
                              placeholder="+7 (978) 000-00-00"
                              aria-label="Телефон"
                            />
                            <input
                              className="rounded-2xl border p-3"
                              value={phone.href}
                              onChange={(event) =>
                                updatePhone(index, "href", event.target.value)
                              }
                              placeholder="tel:+79780000000"
                              aria-label="Ссылка телефона"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removePhone(index)}
                            >
                              Удалить
                            </Button>
                          </div>
                        ))}
                        {!form.phones.length ? (
                          <p className="rounded-2xl bg-slate-100 p-4 text-sm text-steel-500">
                            Телефоны пока не добавлены.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <label className="grid gap-1 text-sm font-semibold text-steel-700">
                      Telegram-ссылка
                      <input
                        className="rounded-2xl border p-3 font-normal"
                        value={form.telegram}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            telegram: event.target.value,
                          }))
                        }
                        placeholder="https://t.me/..."
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-semibold text-steel-700">
                      MAX-ссылка
                      <input
                        className="rounded-2xl border p-3 font-normal"
                        value={form.max}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            max: event.target.value,
                          }))
                        }
                        placeholder="https://max.ru/..."
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-semibold text-steel-700">
                      Avito-ссылка
                      <input
                        className="rounded-2xl border p-3 font-normal"
                        value={form.avito}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            avito: event.target.value,
                          }))
                        }
                        placeholder="https://www.avito.ru/..."
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-semibold text-steel-700">
                      Текст согласия на обработку персональных данных
                      <textarea
                        className="min-h-32 rounded-2xl border p-3 font-normal"
                        value={form.personal_data_consent_text}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            personal_data_consent_text: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Сохранение..." : "Сохранить контакты"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={loadSettings}
                      >
                        Отменить изменения
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : null}

            {activeTab === "calculator" ? (
              <Card>
                <CardHeader className="flex-row items-center justify-between gap-4">
                  <CardTitle>Калькулятор</CardTitle>
                  <Button variant="outline" size="sm" onClick={loadSettings}>
                    Обновить
                  </Button>
                </CardHeader>
                <CardContent>
                  <form className="grid gap-5" onSubmit={saveSettings}>
                    <p className="rounded-2xl bg-copper-50 p-4 text-sm text-steel-700">
                      Эти значения используются в публичном квиз-калькуляторе для
                      вариантов навеса, площади и ориентировочной цены за м².
                    </p>
                    {renderCalculatorGroup(
                      "canopyOptions",
                      "Типы навесов",
                      "multiplier",
                      "Коэффициент",
                      "0.01",
                    )}
                    {renderCalculatorGroup(
                      "sizeOptions",
                      "Размеры",
                      "area",
                      "Площадь, м²",
                    )}
                    {renderCalculatorGroup(
                      "materialOptions",
                      "Материалы",
                      "pricePerMeter",
                      "Цена за м²",
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Сохранение..." : "Сохранить калькулятор"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={loadSettings}
                      >
                        Отменить изменения
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : null}

            {activeTab === "cases" ? (
              <AdminCrudPanel
                {...casesResource}
                request={request}
                showMessage={showMessage}
              />
            ) : null}
            {activeTab === "images" ? (
              <Card>
                <CardHeader className="flex-row items-center justify-between gap-4">
                  <CardTitle>Изображения</CardTitle>
                  <Button variant="outline" size="sm" onClick={loadUploads}>
                    Обновить список
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[240px_1fr]">
                    <label className="grid gap-1 text-sm font-semibold text-steel-700">
                      Категория
                      <select
                        className="rounded-2xl border p-3 font-normal"
                        value={uploadCategory}
                        onChange={(event) =>
                          setUploadCategory(
                            event.target.value as UploadCategory,
                          )
                        }
                      >
                        {uploadCategories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1 text-sm font-semibold text-steel-700">
                      Загрузить файл
                      <input
                        className="rounded-2xl border p-3 font-normal"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) =>
                          uploadStandaloneImage(event.target.files?.[0] ?? null)
                        }
                      />
                      <span className="text-xs font-normal text-steel-500">
                        JPG, PNG или WEBP до 10 МБ. URL появится в списке ниже.
                      </span>
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {uploads.map((upload) => {
                      const category = uploadCategories.find(
                        (item) =>
                          item.value === inferUploadCategory(upload.url),
                      );
                      return (
                        <div
                          className="overflow-hidden rounded-2xl border bg-white"
                          key={upload.id}
                        >
                          <div className="aspect-video bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              className="h-full w-full object-cover"
                              src={upload.url}
                              alt={upload.filename}
                            />
                          </div>
                          <div className="grid gap-2 p-4 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-steel-600">
                                {category?.label ?? "Общие"}
                              </span>
                              <span className="text-xs text-steel-500">
                                {new Intl.NumberFormat("ru-RU", {
                                  maximumFractionDigits: 1,
                                }).format(
                                  upload.size_bytes / (1024 * 1024),
                                )}{" "}
                                МБ
                              </span>
                            </div>
                            <p className="truncate font-semibold text-steel-900">
                              {upload.filename}
                            </p>
                            <input
                              className="rounded-2xl border p-2 text-xs"
                              readOnly
                              value={upload.url}
                              onFocus={(event) => event.currentTarget.select()}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {!uploads.length ? (
                    <p className="rounded-2xl bg-slate-100 p-4 text-center text-sm text-steel-500">
                      Файлы пока не загружены.
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
