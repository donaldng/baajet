import { Injectable } from '@angular/core';
import { format } from 'date-fns'

@Injectable()
export class DateService {
    
    constructor() {
    }

    toString(dateObj){
        return format(dateObj).slice(0, 19)
    }

}
