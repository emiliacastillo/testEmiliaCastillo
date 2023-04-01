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
        map(proyectos=>
          proyectos.map((proyecto) => {
            return {
              id:proyecto.id,
              name: proyecto.name,
              payDays:proyecto.payDays,
              dueDate:proyecto.dueDate,
              fundDate:proyecto.fundDate,
              payspan:proyecto.payspan,
              directDeposit:proyecto.directDeposit
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
  updatePerson(person: Person): Observable<any> {
    const id = typeof person === 'number' ? person : person.id;
    const url = `${this.peopleUrl}/${id}`;
    return this.http.put(url, person, this.httpOptions).pipe(
      tap(_ => this.log(`updated person id=${person.id}`)),
      catchError(this.handleError<any>('updatePerson'))
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
  searchPeople(term: string): Observable<Person[]> {
    if (!term.trim()) {
      // if not search term, return empty person array.
      return of([]);
    }
    return this.http.get<Person[]>(`${this.peopleUrl}/?name=${term}`).pipe(
      tap(x => x.length ?
         this.log(`found people matching "${term}"`) :
         this.log(`no people matching "${term}"`)),
      catchError(this.handleError<Person[]>('searchPeople', []))
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

