import { Injectable } from '@angular/core';
import { format, addDays } from 'date-fns';

@Injectable()
export class DateService {
    
    constructor() {
    }

    dateToString(dateObj){
        return format(dateObj).slice(0, 19);
    }

    addDay(date, days: number){
        return addDays(date, days);
    }
}
