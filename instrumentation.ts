export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    process.on("unhandledRejection", (reason, promise) => {
      console.error("[UNHANDLED REJECTION]", reason);
    });

    process.on("uncaughtException", (error) => {
      console.error("[UNCAUGHT EXCEPTION]", error);
    });

    // Log env check on startup so you can see in Railway logs
    // whether the critical vars are present
    console.log("[STARTUP] ENV CHECK:", {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "MISSING",
      NODE_ENV: process.env.NODE_ENV,
    });
  }
}
