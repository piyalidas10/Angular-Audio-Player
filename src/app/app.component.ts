import { Component } from '@angular/core';
import {AudioService} from './services/audio.service';
import {DataService} from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Angular-Audio-Player';

  state;
  currentFile = {
    index: 0
  };
  files = [];
  index = 0;

  constructor(private audioService: AudioService, private dataService: DataService) {
    // get all songs using API
    this.dataService.getSongs().subscribe((data: any) => {
      this.files = data.response;
      console.log(this.files);
      if (this.files.length > 0) {
        this.loadData(this.files[this.index]);
        this.currentFile.index = this.index;
      }
    });

    // get state of audio streaming
    this.audioService.getState().subscribe(data => {
      this.state = data;
      console.log(this.state);
    });

    // get index to play the selected song on click function
    this.dataService.getIndex().subscribe(index => {
      this.index = index;
      console.log('index => ', this.index);
      if (this.index < this.files.length) {
        this.loadData(this.files[index]);
      }
    });

  }

  ngOnInit() {
  }

  isFirstPlaying(): boolean{
    this.currentFile.index = this.index;
    return this.index === 0;
  }

  isLastPlaying(): boolean{
    this.currentFile.index = this.index;
    return this.index === this.files.length - 1;
  }

  openFile(file, index): void {
    this.currentFile.index = index;
    this.dataService.add(file.url, index);
    this.loadData(file);
  }

  loadData(file): void{
    this.audioService.playStream(file.url).subscribe((ev: Event) => {
      if (ev.type === 'ended'){
        this.audioService.endPlay(); // Remove Previous Instance
        if (!this.isLastPlaying()) {
          this.currentFile.index = this.files.findIndex(elem => elem.id === file.id);
          this.next();
        } else {
          this.currentFile.index = 0;
        }
      }
    });
  }

  onSliderChangeEnd(change): void {
    this.audioService.seekTo(change.value);
  }

  play(): void {
    this.audioService.play();
  }

  pause(): void {
    this.audioService.pause();
  }

  stop(): void {
    this.audioService.stop();
  }

  previous(): void {
    const index = this.index - 1;
    this.currentFile.index = index;
    this.dataService.addIndex(index);
  }

  next(): void {
    const index = this.index + 1;
    console.log('index => ', index);
    this.currentFile.index = index;
    this.dataService.addIndex(index);
  }
}
