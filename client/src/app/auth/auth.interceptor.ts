import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { DataService } from "../data.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const dataService = inject(DataService);

    let clonedRequest = req.clone({ withCredentials: true });

    if (req.method !== 'GET') {
        let csrfToken = dataService.getData('csrftoken') || '';
        clonedRequest = clonedRequest.clone({
            setHeaders: {
                'x-csrftoken': csrfToken,
            },
        });
    }

    return next(clonedRequest);
}