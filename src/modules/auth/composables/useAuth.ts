import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/services/api";
import type {
  CentralLoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  UserResponse,
} from "../interfaces/auth.interface";
import showToast from "@/modules/common/composables/useToast";

const TOKEN_COOKIE_NAME = "token";
const TENANT_COOKIE_NAME = "tenant";

// Helper functions to manage cookies
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const raw = parts.pop()?.split(";").shift() || null;
    return raw ? decodeURIComponent(raw) : null;
  }
  return null;
}

function setCookie(name: string, value: string, days: number = 7): void {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

// Deletes cookie by setting its expiration date in the past
function deleteCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

// Global state shared across all useAuth() calls
const isLoading = ref(false);
const error = ref<string | null>(null);
const user = ref<User | null>(null);

const isAuthenticated = computed(() => !!user.value);

const normalizeTenantSlug = (input: string): string => {
  // Accept user-friendly org names and normalize to a slug expected by the API.
  // Examples: "SIMS Corp" -> "sims-corp", "ecomove" -> "ecomove".
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const formatApiError = (err: any, fallbackMsg: string): string => {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const message = data?.message || err?.message || fallbackMsg;
  if (status) return `${message} (HTTP ${status})`;
  return message;
};

const looksLikeTenancyHeaderError = (err: any): boolean => {
  const status = err?.response?.status;
  const msg = String(err?.response?.data?.message || "").toLowerCase();
  if (status === 422 && (msg.includes("tenant") || msg.includes("x-tenant")))
    return true;
  if (status === 500 && (msg.includes("tenant") || msg.includes("tenancy")))
    return true;
  return false;
};

export function useAuth() {
  const router = useRouter();

  const getToken = (): string | null => {
    return getCookie(TOKEN_COOKIE_NAME);
  };

  const fetchUser = async (): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get<UserResponse>("/user");
      // Merge instead of overwrite to avoid losing existing reactive refs or fields
      user.value = Object.assign({}, user.value || {}, response.data.user);
      return true;
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Token is invalid or expired
        deleteCookie(TOKEN_COOKIE_NAME);
        user.value = null;
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (
    email: string,
    password: string,
    organization: string = "",
  ): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    const normalizedOrganization = normalizeTenantSlug(organization);

    try {
      const response = await apiClient.post<CentralLoginResponse>(
        "/central/login",
        {
          email,
          password,
          ...(normalizedOrganization
            ? { organization: normalizedOrganization }
            : {}),
        },
      );
      const token = response.data.token;
      const tenantId = normalizeTenantSlug(response.data.tenant_id || "");

      if (!token || !tenantId) {
        error.value = "No token received from server";
        deleteCookie(TOKEN_COOKIE_NAME);
        deleteCookie(TENANT_COOKIE_NAME);
        return false;
      }

      setCookie(TENANT_COOKIE_NAME, tenantId);
      setCookie(TOKEN_COOKIE_NAME, token);
      apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

      try {
        localStorage.setItem("active_admin_tenant", tenantId);
      } catch {
        // Ignore unavailable localStorage in restricted contexts.
      }

      const userFetched = await fetchUser();
      if (!userFetched) {
        deleteCookie(TOKEN_COOKIE_NAME);
        deleteCookie(TENANT_COOKIE_NAME);
        error.value = "Could not load user profile after login";
        return false;
      }

      return userFetched;
    } catch (err: any) {
      if (looksLikeTenancyHeaderError(err)) {
        error.value = "Tenant not identified for this account.";
      } else {
        error.value = formatApiError(err, "Error logging in");
      }
      deleteCookie(TOKEN_COOKIE_NAME);
      deleteCookie(TENANT_COOKIE_NAME);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call backend to revoke token
      await apiClient.post("/logout");
      // Clear local state
      deleteCookie(TOKEN_COOKIE_NAME);
      deleteCookie(TENANT_COOKIE_NAME);
      user.value = null;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Error during logout";
      showToast(errorMsg);
      throw err;
    }
  };

  const register = async (
    tenantSlug: string,
    name: string,
    username: string,
    email: string,
    password: string,
  ) => {
    isLoading.value = true;
    error.value = null;

    const normalizedTenant = normalizeTenantSlug(tenantSlug);
    if (!normalizedTenant) {
      error.value = "Organization is required to register";
      isLoading.value = false;
      return false;
    }

    try {
      const registerData: RegisterRequest = {
        name,
        username,
        email,
        password,
        role_id: 2,
      };
      const response = await apiClient.post<RegisterResponse>("/users", registerData, {
        headers: {
          "X-Tenant": normalizedTenant,
        },
      });
      if (response.data) router.push("/login");
      return true;
    } catch (err: any) {
      error.value = formatApiError(err, "Error registering");
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    user,
    isAuthenticated,
    getToken,
    fetchUser,
    login,
    register,
    logout,
  };
}
