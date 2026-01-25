import { getApiUrl } from "@/utils/apiConfig";

const LIGHTBOX_SRC_SANDBOX = "https://tnpg.moamalat.net:6006/js/lightbox.js";
const LIGHTBOX_SRC_PRODUCTION = "https://pgw.moamalat.net:6006/js/lightbox.js";
const DEFAULT_MID = "10081014649";
const DEFAULT_TID = "99179395";
const DEFAULT_SECRET = "3a488a89b3f7993476c252f017c488bb";
const CURRENCY_CODE = "434"; // LYD ISO code

let scriptPromise: Promise<void> | null = null;
let currentEnv: "sandbox" | "production" = "sandbox";
let currentLightboxSrc = LIGHTBOX_SRC_SANDBOX;

function getBrowserEnv(key: string): string | undefined {
  const w: any = typeof window !== "undefined" ? window : {};
  const nodeEnv: any = typeof process !== "undefined" ? (process as any).env ?? {} : {};
  const viteEnv: any = typeof import.meta !== "undefined" ? (import.meta as any).env ?? {} : {};

  return (
    nodeEnv[`NEXT_PUBLIC_${key}`] ??
    nodeEnv[`VITE_${key}`] ??
    viteEnv[`NEXT_PUBLIC_${key}`] ??
    viteEnv[`VITE_${key}`] ??
    nodeEnv[key] ??
    w[key]
  );
}

function getFirstEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = getBrowserEnv(key);
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
}

function formatTrxDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}${m}${d}${hh}${mm}`;
}

async function ensureScriptLoaded(env?: "sandbox" | "production"): Promise<void> {
  if (typeof window === "undefined") return;

  if (env && currentEnv !== env) {
    currentEnv = env;
  }

  currentLightboxSrc = currentEnv === "production" ? LIGHTBOX_SRC_PRODUCTION : LIGHTBOX_SRC_SANDBOX;

  let existing = document.querySelector<HTMLScriptElement>("script[data-moamalat]");
  if (existing && existing.src !== currentLightboxSrc) {
    existing.remove();
    existing = null;
    (window as any).Lightbox = undefined;
    scriptPromise = null;
  }

  if ((window as any).Lightbox?.Checkout && existing) {
    return;
  }

  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const currentScript = document.querySelector<HTMLScriptElement>("script[data-moamalat]");
      if (currentScript) {
        currentScript.addEventListener("load", () => resolve(), { once: true });
        currentScript.addEventListener("error", () => reject(new Error("فشل تحميل سكربت بوابة معاملات")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = currentLightboxSrc;
      script.async = true;
      script.dataset.moamalat = currentLightboxSrc;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("فشل تحميل سكربت بوابة معاملات"));
      document.head.appendChild(script);
    })
      .then(async () => {
        const start = Date.now();
        while (!(window as any).Lightbox?.Checkout) {
          if (Date.now() - start > 8000) {
            throw new Error("Lightbox SDK لم يصبح جاهزاً");
          }
          await new Promise((r) => setTimeout(r, 100));
        }
      })
      .catch((error) => {
        scriptPromise = null;
        throw error;
      });
  }

  await scriptPromise;
}

async function fetchServerConfig(): Promise<{ MID?: string; TID?: string; ENV?: string }> {
  try {
    const response = await fetch(`${getApiUrl()}/moamalat/config`);
    if (!response.ok) return {};
    return (await response.json()) as { MID?: string; TID?: string; ENV?: string };
  } catch {
    return {};
  }
}

async function resolveMerchantCredentials(): Promise<{ MID: string; TID: string; ENV: "sandbox" | "production" }> {
  let MID = getFirstEnv("MOAMALAT_MID", "MOAMALATPAY_MID");
  let TID = getFirstEnv("MOAMALAT_TID", "MOAMALATPAY_TID");
  let envFlag = getBrowserEnv("MOAMALAT_ENV");
  if (!envFlag) {
    const prod = getBrowserEnv("MOAMALATPAY_PRODUCTION");
    envFlag = prod && prod.toLowerCase() === "true" ? "production" : undefined;
  }

  if (!MID || !TID) {
    const { MID: serverMID, TID: serverTID, ENV } = await fetchServerConfig();
    MID = MID ?? serverMID;
    TID = TID ?? serverTID;
    envFlag = envFlag ?? ENV;
  }

  MID = MID ?? DEFAULT_MID;
  TID = TID ?? DEFAULT_TID;

  if (!MID || !TID) {
    throw new Error("بيانات التاجر غير مكتملة (MID/TID)");
  }

  const desiredEnv = envFlag && envFlag.toLowerCase() === "production" ? "production" : "sandbox";
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "";
  const ENV = isLocalHost ? "sandbox" : desiredEnv;
  currentEnv = ENV;
  currentLightboxSrc = ENV === "production" ? LIGHTBOX_SRC_PRODUCTION : LIGHTBOX_SRC_SANDBOX;

  return { MID, TID, ENV };
}

async function requestSecureHash(payload: {
  Amount: string;
  DateTimeLocalTrxn: string;
  MerchantId: string;
  MerchantReference: string;
  TerminalId: string;
}): Promise<string> {
  try {
    const response = await fetch(`${getApiUrl()}/moamalat/hash`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Hash endpoint error");
    }

    const data = (await response.json()) as { secureHash?: string };
    if (!data.secureHash) {
      throw new Error("لم يتم استلام SecureHash من الخادم");
    }
    return data.secureHash;
  } catch (error) {
    const keyHex = (window as any).__MOAMALAT_TEST_KEY__ as string | undefined ?? DEFAULT_SECRET;
    if (!keyHex) {
      throw error instanceof Error ? error : new Error("فشل توليد SecureHash");
    }

    (window as any).__MOAMALAT_TEST_KEY__ = keyHex;

    const message = `Amount=${payload.Amount}&DateTimeLocalTrxn=${payload.DateTimeLocalTrxn}&MerchantId=${payload.MerchantId}&MerchantReference=${payload.MerchantReference}&TerminalId=${payload.TerminalId}`;
    return await hmacSha256HexUpper(message, keyHex);
  }
}

async function hmacSha256HexUpper(message: string, hexKey: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("HMAC غير مدعوم في هذا المتصفح");
  }

  const hexToBytes = (hex: string) => {
    const result = new Uint8Array(hex.length / 2);
    for (let i = 0; i < result.length; i += 1) {
      result[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return result;
  };

  const keyBytes = hexToBytes(hexKey.trim());
  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export interface OpenMoamalatOptions {
  amountLYD: number;
  referencePrefix?: string;
  orderId?: string;
  customerEmail?: string;
  customerMobile?: string;
  additionalConfig?: Record<string, unknown>;
  returnUrl?: string;
  callbackUrl?: string;
  onComplete: (data: any) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
}

export async function openMoamalatLightbox(options: OpenMoamalatOptions): Promise<string> {
  const { MID, TID, ENV } = await resolveMerchantCredentials();
  await ensureScriptLoaded(ENV);

  const amountMinorUnits = String(Math.round(Number(options.amountLYD) * 100));
  const trxDateTime = formatTrxDateTime(new Date());
  const merchantReference = `${options.referencePrefix ?? "ESH"}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const payload = {
    Amount: amountMinorUnits,
    DateTimeLocalTrxn: trxDateTime,
    MerchantId: MID,
    MerchantReference: merchantReference,
    TerminalId: TID,
  };

  const secureHash = await requestSecureHash(payload);

  const configure: any = {
    MID,
    TID,
    AmountTrxn: amountMinorUnits,
    MerchantReference: merchantReference,
    TrxDateTime: trxDateTime,
    SecureHash: secureHash,
    CurrencyCode: CURRENCY_CODE,
    MOAMALATPAY_PRODUCTION: ENV === "production",
    ReturnUrl: options.returnUrl ?? `${window.location.origin}/payment-success`,
    CallbackUrl: options.callbackUrl ?? `${window.location.origin}/payment-callback`,
    completeCallback: (data: any) => {
      options.onComplete?.(data);
    },
    errorCallback: (error: any) => {
      options.onError?.(error);
    },
    cancelCallback: () => {
      options.onCancel?.();
    },
  };

  if (options.orderId) configure.OrderId = options.orderId;
  if (options.customerEmail) configure.CustomerEmail = options.customerEmail;
  if (options.customerMobile) configure.CustomerMobile = options.customerMobile;
  if (options.additionalConfig) Object.assign(configure, options.additionalConfig);

  (window as any).Lightbox.Checkout.configure = configure;
  (window as any).Lightbox.Checkout.showLightbox();

  return merchantReference;
}

export async function ensureMoamalatScript(): Promise<void> {
  await ensureScriptLoaded();
}
