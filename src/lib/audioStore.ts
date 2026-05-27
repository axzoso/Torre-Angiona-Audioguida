export interface TappaInfo {
  src: string;
  titolo: string;
  numero: number;
}

class AudioStore extends EventTarget {
  private _current: TappaInfo | null = null;
  private _playing = false;

  get current(): TappaInfo | null {
    return this._current;
  }

  get playing(): boolean {
    return this._playing;
  }

  playTappa(info: TappaInfo): void {
    this._current = info;
    this.dispatchEvent(new CustomEvent('play-tappa', { detail: info }));
  }

  togglePlay(): void {
    this.dispatchEvent(new CustomEvent('toggle-play'));
  }

  seekRelative(seconds: number): void {
    this.dispatchEvent(new CustomEvent('seek-relative', { detail: { seconds } }));
  }

  reportState(playing: boolean, src: string): void {
    this._playing = playing;
    this.dispatchEvent(new CustomEvent('state-changed', { detail: { playing, src } }));
  }

  reportProgress(currentTime: number, duration: number, src: string): void {
    this.dispatchEvent(
      new CustomEvent('progress', { detail: { currentTime, duration, src } }),
    );
  }
}

export const audioStore = new AudioStore();
