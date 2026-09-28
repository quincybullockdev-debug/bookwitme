import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  // remove port (:3000), then remove .localhost part to get just the subdomain
  const subdomain =
    request.headers.get("host")?.split(":")[0].split(".")[0] || "";
  console.log("SUBDOMAIN:", subdomain);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // query the database for a business with this subdomain
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("subdomain", subdomain)
    .single();

  console.log("BUSINESS FOUND:", business?.name || "NONE");

  if (business) {
    const url = request.nextUrl.clone();
    url.pathname = `/site${url.pathname}`;
    const rewriteResponse = NextResponse.rewrite(url);
    rewriteResponse.headers.set("x-business-id", business.id);
    rewriteResponse.headers.set("x-subdomain", subdomain);
    return rewriteResponse;
  } else if (subdomain !== "localhost" && subdomain !== "") {
    // real subdomain typed, but no matching business
    const url = request.nextUrl.clone();
    url.pathname = "/business-not-found";
    return NextResponse.rewrite(url);
  }

  // store business_id in response headers so pages can access it
  response.headers.set("x-business-id", business?.id || "");
  response.headers.set("x-subdomain", subdomain);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
