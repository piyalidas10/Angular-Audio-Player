import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StreamState } from '../interface/stream-state';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  state: StreamState = {
    playing: false,
    readableCurrentTime: '',
    readableDuration: '',
    duration: undefined,
    currentTime: undefined,
    volume: 0.5,
    canplay: false,
    error: false,
  };
  stop$ = new Subject();
  audioObj = new Audio();
  audioEvents = [
    'ended',
    'error',
    'play',
    'playing',
    'pause',
    'stop',
    'timeupdate',
    'canplay',
    'loadedmetadata',
    'loadstart'
  ];

  private stateChange: BehaviorSubject<StreamState> = new BehaviorSubject(this.state);

  constructor() { }


  updateStateEvents(eventType: string): void {
    switch (eventType) {
      case 'canplay':
        this.state.duration = this.audioObj.duration;
        this.state.readableDuration = this.formatTime(this.state.duration);
        this.state.canplay = true;
        break;
      case 'playing':
        this.state.playing = true;
        console.log(this.state);
        break;
      case 'pause':
        this.state.playing = false;
        break;
      case 'stop':
        this.state.playing = false;
        this.state.currentTime = this.audioObj.currentTime;
        this.state.readableCurrentTime = this.formatTime(this.state.currentTime);
        console.log(this.state);
        break;
      case 'timeupdate':
        this.state.currentTime = this.audioObj.currentTime;
        this.state.readableCurrentTime = this.formatTime(this.state.currentTime);
        break;
      case 'error':
        this.resetState();
        this.state.error = true;
        break;
    }
    this.stateChange.next(this.state);
  }

  resetState(): void {
    this.state = {
      playing: false,
      readableCurrentTime: '',
      readableDuration: '',
      duration: undefined,
      currentTime: undefined,
      volume: 0.5,
      canplay: false,
      error: false
    };
  }

  getState(): Observable<StreamState> {
    return this.stateChange.asObservable();
  }

  // audio streaming - play songs one by one
  streamObservable(url): any {

    return new Observable(observer => {
      // Play audio
      this.audioObj.src = url;
      this.audioObj.load();
      this.audioObj.play();

      const handler = (event: Event) => {
        console.log(event.type);
        this.updateStateEvents(event.type);
        observer.next(event);
      };

      this.addEvents(this.audioObj, this.audioEvents, handler);
      return () => {
        // Stop Playing
        this.audioObj.pause();
        this.audioObj.currentTime = 0;
        // remove event listeners
        this.removeEvents(this.audioObj, this.audioEvents, handler);
        // reset state
        this.resetState();
      };
    });
  }

  private addEvents(obj: HTMLAudioElement, events: any[], handler: (event: Event) => any): void {
    events.forEach((evt: any) => {
      obj.addEventListener(evt, handler);
    });
  }

  private removeEvents(obj: HTMLAudioElement, events: any[], handler: (event: Event) => any): void {
    events.forEach((evt: any) => {
      obj.removeEventListener(evt, handler);
    });
  }

  playStream(url): any {
    return this.streamObservable(url).pipe(takeUntil(this.stop$));
  }

  play(): void {
    this.audioObj.play();
    this.updateStateEvents('playing');
  }

  pause(): void {
    this.audioObj.pause();
  }

  stop(): void{
    this.audioObj.pause();
    this.seekTo(0);
    this.updateStateEvents('stop');
  }

  endPlay(): void{
    this.stop$.next();
    this.stop$.subscribe();
  }

  seekTo(seconds): void {
    this.audioObj.currentTime = seconds;
  }

  formatTime(time: number, format: string = 'HH:mm:ss'): any {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }
}
