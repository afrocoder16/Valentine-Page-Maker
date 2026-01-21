export const ENTITLEMENT_STORAGE_KEY = "bmv:entitlement_session_id";

export const readEntitlementSessionId = () => {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(ENTITLEMENT_STORAGE_KEY) ?? "";
};

export const writeEntitlementSessionId = (sessionId: string) => {
  if (typeof window === "undefined") {
    return;
  }
  if (!sessionId) {
    return;
  }
  window.localStorage.setItem(ENTITLEMENT_STORAGE_KEY, sessionId);
};

export const clearEntitlementSessionId = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(ENTITLEMENT_STORAGE_KEY);
};
