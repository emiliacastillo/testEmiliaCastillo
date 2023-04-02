import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Person } from '../../module/person';
import { catchError, map, tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private peopleUrl = 'https://my-json-server.typicode.com/emiliacastillo/testAngular/data';  
  
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(private http: HttpClient) { }
  getPeople(): Observable<Person[]> {
    return this.http.get<Person[]>(this.peopleUrl)
      .pipe(
        map(el=>
          el.map((element) => {
            return {
              id:element.id,
              name: element.name,
              payDay:element.payDay,
              dueDate:element.dueDate,
              fundDate:element.fundDate,
              payspan:element.payspan,
              directDeposit:element.directDeposit
            };
          }) 
        ),
        tap(_ => this.log('fetched People')),
        catchError(this.handleError<Person[]>('getPeople', []))
      );
  } 

  getPerson(id: number): Observable<Person> {
    const url = `${this.peopleUrl}/${id}`;
    return this.http.get<Person>(url)
    .pipe(
        tap(_ => this.log('fetched Person id='+id)),
        catchError(this.handleError<Person>('getPerson id=${id}'))
    );
  }
  addPerson(person: Person): Observable<Person> {
    return this.http.post<Person>(this.peopleUrl, person, this.httpOptions).pipe(
      tap((newPerson: Person) => this.log(`added person w/ id=${newPerson.id} `)),
      catchError(this.handleError<Person>('addPerson'))
    );
  }
  deletePerson(person: Person | number): Observable<Person> {
    const id = typeof person === 'number' ? person : person.id;
    const url = `${this.peopleUrl}/${1}`;
  
    return this.http.delete<Person>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted person id=${id}`)),
      catchError(this.handleError<Person>('deletePerson'))
    );
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
  private log(message: string) {
    console.log(message);
  } 
}

