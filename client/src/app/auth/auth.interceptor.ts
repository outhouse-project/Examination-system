import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { DataService } from "../data.service";
import { finalize } from "rxjs";
import { HttpLoaderService } from "../common/http-loader/http-loader.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const dataService = inject(DataService);
    const loaderService = inject(HttpLoaderService);

    let clonedRequest = req.clone({ withCredentials: true });

    if (req.method !== 'GET') {
        let csrfToken = dataService.getData('csrftoken') || '';
        clonedRequest = clonedRequest.clone({
            setHeaders: {
                'x-csrftoken': csrfToken,
            },
        });
    }

    loaderService.show();
    return next(clonedRequest).pipe(
        finalize(() => {
            loaderService.hide();
        })
    );
}