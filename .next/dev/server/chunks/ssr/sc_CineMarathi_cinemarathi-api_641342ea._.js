module.exports = [
"[project]/sc/CineMarathi/cinemarathi-api/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/sc/CineMarathi/cinemarathi-api/components/ui/button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/@radix-ui/react-slot/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            destructive: 'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
            outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
            link: 'text-primary underline-offset-4 hover:underline'
        },
        size: {
            default: 'h-9 px-4 py-2 has-[>svg]:px-3',
            sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
            lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
            icon: 'size-9',
            'icon-sm': 'size-8',
            'icon-lg': 'size-10'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'default'
    }
});
function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Slot"] : 'button';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/sc/CineMarathi/cinemarathi-api/components/ui/button.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/sc/CineMarathi/cinemarathi-api/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Global API utility for making requests to the backend
 * Uses ENVIRONMENT variable to switch between LIVE and LOCAL credentials
 */ // Determine if we're using live or local environment
__turbopack_context__.s([
    "API_BASE_URL",
    ()=>API_BASE_URL,
    "apiDelete",
    ()=>apiDelete,
    "apiGet",
    ()=>apiGet,
    "apiPatch",
    ()=>apiPatch,
    "apiPost",
    ()=>apiPost,
    "apiPut",
    ()=>apiPut,
    "apiRequest",
    ()=>apiRequest
]);
const getEnvironment = ()=>{
    // Check ENVIRONMENT variable first (primary method)
    const env = process.env.ENVIRONMENT || ("TURBOPACK compile-time value", "local");
    if (env === "live" || env === "production") {
        return "live";
    }
    if (env === "local" || env === "development") {
        return "local";
    }
    // Fallback to NODE_ENV if ENVIRONMENT is not set
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Default to local
    return "local";
};
// Get API base URL from environment variables
// For client-side: use NEXT_PUBLIC_ prefix so it's available in browser
// For server-side: can use regular env vars
const getApiBaseUrl = ()=>{
    const environment = getEnvironment();
    // In browser/client-side
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // On server-side
    if (environment === "live") {
        return process.env.API_BASE_URL_LIVE || ("TURBOPACK compile-time value", "https://api.cine.fluttertales.tech/api") || "https://api.cine.fluttertales.tech/api";
    }
    return process.env.API_BASE_URL_LOCAL || ("TURBOPACK compile-time value", "http://localhost:3001/api") || "http://localhost:3001/api";
};
// Normalize the base URL (remove trailing slash, ensure it ends with /api if needed)
const normalizeBaseUrl = (url)=>{
    let normalized = url.trim();
    // Remove trailing slash
    if (normalized.endsWith("/")) {
        normalized = normalized.slice(0, -1);
    }
    // If it already ends with /api, return as is
    if (normalized.endsWith("/api")) {
        return normalized;
    }
    // If it doesn't end with /api, add it
    normalized = normalized + "/api";
    return normalized;
};
const API_BASE_URL = normalizeBaseUrl(getApiBaseUrl());
/**
 * Build full URL from endpoint
 * @param endpoint - API endpoint (e.g., "/admin-auth/login" or "admin-auth/login")
 * @returns Full URL
 */ const buildUrl = (endpoint)=>{
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    // If base URL already includes /api, don't add it again
    if (API_BASE_URL.endsWith("/api")) {
        return `${API_BASE_URL}/${cleanEndpoint}`;
    }
    return `${API_BASE_URL}/${cleanEndpoint}`;
};
const apiRequest = async (endpoint, options = {})=>{
    const { token, params, ...fetchOptions } = options;
    // Build URL
    let url = buildUrl(endpoint);
    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value])=>{
            searchParams.append(key, String(value));
        });
        url += `?${searchParams.toString()}`;
    }
    // Set default headers
    const headers = {
        "Content-Type": "application/json",
        ...fetchOptions.headers || {}
    };
    // Add authorization token if provided
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    // Make the request
    const response = await fetch(url, {
        ...fetchOptions,
        headers
    });
    // Parse response
    const data = await response.json();
    // Throw error if response is not ok
    if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }
    return data;
};
const apiGet = (endpoint, options)=>{
    return apiRequest(endpoint, {
        ...options,
        method: "GET"
    });
};
const apiPost = (endpoint, body, options)=>{
    return apiRequest(endpoint, {
        ...options,
        method: "POST",
        body: JSON.stringify(body)
    });
};
const apiPut = (endpoint, body, options)=>{
    return apiRequest(endpoint, {
        ...options,
        method: "PUT",
        body: JSON.stringify(body)
    });
};
const apiPatch = (endpoint, body, options)=>{
    return apiRequest(endpoint, {
        ...options,
        method: "PATCH",
        body: JSON.stringify(body)
    });
};
const apiDelete = (endpoint, options)=>{
    return apiRequest(endpoint, {
        ...options,
        method: "DELETE"
    });
};
;
}),
"[project]/sc/CineMarathi/cinemarathi-api/lib/admin-auth.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adminLogin",
    ()=>adminLogin,
    "adminLogout",
    ()=>adminLogout,
    "clearAdminAuth",
    ()=>clearAdminAuth,
    "getAdminToken",
    ()=>getAdminToken,
    "getAdminUser",
    ()=>getAdminUser,
    "setAdminAuth",
    ()=>setAdminAuth,
    "verifyAdminToken",
    ()=>verifyAdminToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/lib/api.ts [app-ssr] (ecmascript)");
const getAdminToken = ()=>{
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
};
const getAdminUser = ()=>{
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
    const user = undefined;
};
const setAdminAuth = (token, user)=>{
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(user));
};
const clearAdminAuth = ()=>{
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
};
;
const verifyAdminToken = async (token)=>{
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin-auth/verify", {
            method: "POST",
            token
        });
        return true;
    } catch (error) {
        console.error("[v0] Token verification error:", error);
        return false;
    }
};
const adminLogin = async (email, password)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPost"])("/admin-auth/login", {
        email,
        password
    });
};
const adminLogout = async (token)=>{
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiPost"])("/admin-auth/logout", undefined, {
            token
        });
    } catch (error) {
        console.error("[v0] Logout error:", error);
    }
};
}),
"[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-ssr] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$film$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Film$3e$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/lucide-react/dist/esm/icons/film.js [app-ssr] (ecmascript) <export default as Film>");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/lucide-react/dist/esm/icons/credit-card.js [app-ssr] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/lucide-react/dist/esm/icons/menu.js [app-ssr] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/node_modules/lucide-react/dist/esm/icons/crown.js [app-ssr] (ecmascript) <export default as Crown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/sc/CineMarathi/cinemarathi-api/lib/admin-auth.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
const navItems = [
    {
        href: "/admin",
        label: "Dashboard",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"]
    },
    {
        href: "/admin/users",
        label: "Users",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"]
    },
    {
        href: "/admin/premium-users",
        label: "Premium Users",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"]
    },
    {
        href: "/admin/casting",
        label: "Casting Calls",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$film$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Film$3e$__["Film"]
    },
    {
        href: "/admin/subscriptions",
        label: "Subscriptions",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"]
    },
    {
        href: "/admin/settings",
        label: "Settings",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"]
    }
];
function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [adminUser, setAdminUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isVerified, setIsVerified] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const isLoginPage = pathname === "/admin/login";
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Skip auth check for login page
        if (isLoginPage) {
            setIsVerified(true);
            setAdminUser(null);
            return;
        }
        const verifyAdmin = async ()=>{
            const token = localStorage.getItem("adminToken");
            const user = localStorage.getItem("adminUser");
            if (!token || !user) {
                setIsVerified(false);
                router.replace("/admin/login");
                return;
            }
            try {
                const isValid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["verifyAdminToken"])(token);
                if (!isValid) {
                    localStorage.removeItem("adminToken");
                    localStorage.removeItem("adminUser");
                    setIsVerified(false);
                    router.replace("/admin/login");
                    return;
                }
                setAdminUser(JSON.parse(user));
                setIsVerified(true);
            } catch (error) {
                console.error("[v0] Token verification failed:", error);
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");
                setIsVerified(false);
                router.replace("/admin/login");
            }
        };
        verifyAdmin();
    }, [
        router,
        pathname
    ]);
    const handleLogout = async ()=>{
        try {
            // Get token before clearing
            const token = localStorage.getItem("adminToken");
            // Clear localStorage first
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
            // Clear state
            setAdminUser(null);
            setIsVerified(false);
            // Call logout API if token exists
            if (token) {
                try {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adminLogout"])(token);
                } catch (error) {
                    console.error("[v0] Logout API error:", error);
                }
            }
            // Redirect to login
            router.replace("/admin/login");
        } catch (error) {
            console.error("[v0] Logout error:", error);
            // Still redirect even if there's an error
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
            router.replace("/admin/login");
        }
    };
    // For login page, render without sidebar or layout
    if (isLoginPage) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-background",
            children: children
        }, void 0, false, {
            fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
            lineNumber: 106,
            columnNumber: 7
        }, this);
    }
    // Show loading if not verified yet (but not on login page)
    if (!isVerified) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex items-center justify-center bg-background",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-muted-foreground",
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                lineNumber: 116,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
            lineNumber: 115,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-screen bg-background",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: `${sidebarOpen ? "w-64" : "w-20"} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6 border-b border-sidebar-border flex items-center justify-between",
                        children: [
                            sidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-xl font-bold text-sidebar-foreground",
                                children: "CineMarathi"
                            }, void 0, false, {
                                fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                                lineNumber: 131,
                                columnNumber: 27
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSidebarOpen(!sidebarOpen),
                                className: "p-2 hover:bg-sidebar-accent rounded-lg transition-colors",
                                children: sidebarOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                                    lineNumber: 136,
                                    columnNumber: 28
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                                    lineNumber: 136,
                                    columnNumber: 46
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                                lineNumber: 132,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "flex-1 p-4 space-y-2",
                        children: navItems.map((item)=>{
                            const Icon = item.icon;
                            const isActive = pathname === item.href || item.href !== "/admin" && pathname?.startsWith(item.href);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: item.href,
                                className: `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                        size: 20
                                    }, void 0, false, {
                                        fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                                        lineNumber: 155,
                                        columnNumber: 17
                                    }, this),
                                    sidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: item.label
                                    }, void 0, false, {
                                        fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                                        lineNumber: 156,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, item.href, true, {
                                fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                                lineNumber: 146,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 border-t border-sidebar-border",
                        children: [
                            sidebarOpen && adminUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4 p-3 bg-sidebar-accent rounded-lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-sidebar-foreground font-medium",
                                        children: adminUser.name
                                    }, void 0, false, {
                                        fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                                        lineNumber: 165,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground",
                                        children: adminUser.email
                                    }, void 0, false, {
                                        fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                                        lineNumber: 166,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                                lineNumber: 164,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                onClick: handleLogout,
                                variant: "destructive",
                                className: "w-full flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                        size: 18
                                    }, void 0, false, {
                                        fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                                        lineNumber: 170,
                                        columnNumber: 13
                                    }, this),
                                    sidebarOpen && "Logout"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                                lineNumber: 169,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                        lineNumber: 162,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                lineNumber: 124,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 overflow-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "bg-card border-b border-border h-16 flex items-center px-8 sticky top-0 z-10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-xl font-semibold text-card-foreground",
                            children: "Admin Panel"
                        }, void 0, false, {
                            fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                            lineNumber: 180,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                        lineNumber: 179,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$sc$2f$CineMarathi$2f$cinemarathi$2d$api$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-8",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                        lineNumber: 184,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
                lineNumber: 177,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/sc/CineMarathi/cinemarathi-api/app/admin/layout.jsx",
        lineNumber: 122,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=sc_CineMarathi_cinemarathi-api_641342ea._.js.map