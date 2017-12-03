import { Injectable } from '@angular/core';
import { format, addDays } from 'date-fns'

@Injectable()
export class DateService {
    
    constructor() {
    }

    toString(dateObj){
        return format(dateObj).slice(0, 19)
    }

    addDay(date, days){
        return addDays(date, days);
    }
}
