import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";


export async function middleware(request: NextRequest) {
    const accessToken = request.cookies.get('accessToken')?.value;
    const { pathname } = request.nextUrl;

    const publicRoutes = ["/auth/register", "/auth/login"];

    if (!accessToken) {
        if (publicRoutes.includes(pathname) || pathname === '/home') {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
        const payload = await jwtVerify(accessToken, new TextEncoder().encode(process.env.JWT_SECRET));
        const { role } = payload.payload as { role: string };

        if (publicRoutes.includes(pathname)) {
            return NextResponse.redirect(new URL(role === 'admin' ? '/admin/podcasts/list' : '/home', request.url));
        }

        if (pathname.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL('/home', request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Token Validation Failed', error);

        const refreshResponse = await fetch(`${process.env.BACK_END_URL}/api/auth/refresh-token`, {
            method: "POST",
            headers: {
                cookie: request.headers.get('cookie') || ''
            }
        });

        if (refreshResponse.ok) {
            const response = NextResponse.next();
            response.cookies.set('accessToken', refreshResponse.headers.get('Set-Cookie') || '');
            return response;
        } else {
            const response = NextResponse.redirect(new URL('/auth/login', request.url));
            response.cookies.delete('accessToken');
            response.cookies.delete('refreshToken');
            return response;
        }
    }
}


export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};

