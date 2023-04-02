import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Holiday } from 'src/app/module/holiday';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { join } from 'path';

@Injectable({
  providedIn: 'root'
})
export class PaydatecalculatorService {
  private incrementDays: number=10;
  private paySpan!: string;
  private hasDirectDeposit!: boolean;
  private firstPayDay!: Date;
  private newrange!: Date;
  private dueDateTemp!: Date;
  private holidays!: Date[];
  private looptype!: string;
  private url = 'https://my-json-server.typicode.com/emiliacastillo/testangular2/data';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(private http: HttpClient) { }
  private log(message: string) {
    console.log(message);
  }
  getHolidays(): Observable<Holiday[]> {
    return this.http.get<Holiday[]>(this.url)
      .pipe(
        map(el =>
          el.map((element) => {
            return {
              id:element.id,
              name: element.name,
              date: element.date
            };
          })
        ),
        tap(_ => this.log('fetched Holiday')),
        catchError(this.handleError<Holiday[]>('getHolidays', []))
      );
  }
  compareDates(){
    const result=this.holidays.filter(word => this.dueDateTemp.toUTCString()==word.toUTCString());
    return result.length>0? true: false;
  }
  firtspayDate(fundDayDate: Date, paySpan: string): any {
    let firstPayDay: Date;
    if (paySpan === "Weekly") {
      firstPayDay = fundDayDate;
      firstPayDay.setDate(firstPayDay.getDate() + 7);
      this.firstPayDay = firstPayDay;
    }
    if (paySpan === "Bi-Weekly") {
      firstPayDay = fundDayDate;
      firstPayDay.setDate(firstPayDay.getDate() + 14);
      this.firstPayDay = firstPayDay;
    }
    if (paySpan === "Monthly") {
      firstPayDay = fundDayDate;
      firstPayDay.setMonth(firstPayDay.getMonth() + 1);
      this.firstPayDay = firstPayDay;

    }
  }
  increaseDay(): any {
    if (this.looptype === 'Forward') {
      this.dueDateTemp.setDate(this.dueDateTemp.getDate() + 1);
    }
    else {
      this.dueDateTemp.setDate(this.dueDateTemp.getDate() - 1);
    }
    return this.isWeekend();
  }
  isWeekend(): any {
    if (this.dueDateTemp.getDay() > 0 && this.dueDateTemp.getDay() < 6) {
      return this.isHolidays();
    }
    else {
      return this.increaseDay();
    }
  }
  isHolidays(): any {

    let day = '' + this.dueDateTemp.getDate();
    let month = '' + (this.dueDateTemp.getMonth() + 1);
    const year = this.dueDateTemp.getFullYear();
    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;
    const cad = [year, month, day].join('-');
    if (!this.compareDates()) {
      return this.isGreaterThan_newrange();
    }
    else {
      this.looptype = 'Reverse';
      return this.increaseDay();

    }
  }
  isGreaterThan_newrange(): any {
    if (this.dueDateTemp >= this.newrange) {
      return this.dueDateTemp;
    }
    else {
      this.looptype = 'Forward';
      this.firtspayDate(this.firstPayDay, this.paySpan);
      this.dueDateTemp=new Date(this.firstPayDay)
      return this.isDeposit();
    }
  }
  isDeposit(): any {
    if (this.hasDirectDeposit) {
      return this.isWeekend();
    }
    else {
      return this.increaseDay();
    }
  }
  public calculateDueDate(fundDay: Date, holiDays: Date[], paySpan: string, payDay: Date, hasDirectDeposit: boolean): any {
    let fundIncrementDays = new Date(fundDay);
    fundIncrementDays.setDate(fundIncrementDays.getDate() + this.incrementDays);

    this.firtspayDate(fundDay, paySpan);
    this.dueDateTemp = new Date(this.firstPayDay);
    this.looptype = 'Forward';
    this.paySpan = paySpan;
    this.newrange = fundIncrementDays;
    this.holidays = holiDays;
    this.hasDirectDeposit = hasDirectDeposit;
    return this.isDeposit();

  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
  addHoliday(holiday: Holiday): Observable<Holiday> {
    return this.http.post<Holiday>(this.url, holiday, this.httpOptions).pipe(
      tap((newholiday: Holiday) => this.log(`added holiday w/ id=${newholiday.id} `)),
      catchError(this.handleError<Holiday>('addholiday'))
    );
  }
  deleteHoliday(holiday: Holiday | number): Observable<Holiday> {
    const id = typeof holiday === 'number' ? holiday : holiday.id;
    const url = `${this.url}/${1}`;
  
    return this.http.delete<Holiday>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted holiday id=${id}`)),
      catchError(this.handleError<Holiday>('deleteHoliday'))
    );
  }
}
