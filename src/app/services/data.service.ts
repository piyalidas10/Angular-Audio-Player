import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private song = {
    url: '',
    author: '',
    artist: ''
  };
  public headers: HttpHeaders;
  public RQSTOptions: any;
  private data = new BehaviorSubject<any>(this.song);
  private index = new Subject<number>();
  constructor(private http: HttpClient) {
    this.setHeader();
  }

  setHeader() {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    this.RQSTOptions = {
      headers: this.headers,
      responseType: 'json'
    };
  }

  getSongs(): Observable<any> {
    return this.http.get<any>('http://localhost:4200/assets/mockdata.json', this.RQSTOptions).pipe(catchError(this.handleError));
  }

  add(data, index): void {
    this.data.next(data);
    this.addIndex(index);
  }

  addIndex(index): void {
    this.index.next(index);
  }

  get(): any {
    return this.data;
  }
  getIndex(): any{
    return this.index;
  }

  // Handle API errors
  handleError(error: HttpErrorResponse): any {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }
}
