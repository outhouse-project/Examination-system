import { HttpInterceptorFn } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const csrfToken = getCsrfTokenFromCookies();
    req = req.clone({
        withCredentials: true,
        setHeaders: {
            'x-csrftoken': csrfToken
        }
    });
    return next(req);
}

function getCsrfTokenFromCookies(): string {
    const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
    return csrfCookie ? csrfCookie.split('=')[1] : '';
}