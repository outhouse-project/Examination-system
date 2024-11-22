import { AbstractControl } from '@angular/forms';

export function futureDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const selectedDate = new Date(control.value);
    const currentDate = new Date();

    return selectedDate > currentDate ? null : { notFutureDate: true };
}