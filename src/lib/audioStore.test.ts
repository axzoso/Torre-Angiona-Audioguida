import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioStore } from './audioStore';

describe('audioStore', () => {
  beforeEach(() => {
    // Reset state between tests
    audioStore.reportState(false, '');
  });

  it('dispatches play-tappa event with correct detail', () => {
    const handler = vi.fn();
    audioStore.addEventListener('play-tappa', handler);

    audioStore.playTappa({ src: '/audio/tappa1.mp3', titolo: 'Ingresso', numero: 1 });

    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail).toEqual({ src: '/audio/tappa1.mp3', titolo: 'Ingresso', numero: 1 });

    audioStore.removeEventListener('play-tappa', handler);
  });

  it('dispatches toggle-play event', () => {
    const handler = vi.fn();
    audioStore.addEventListener('toggle-play', handler);

    audioStore.togglePlay();

    expect(handler).toHaveBeenCalledOnce();
    audioStore.removeEventListener('toggle-play', handler);
  });

  it('dispatches seek-relative event with correct seconds', () => {
    const handler = vi.fn();
    audioStore.addEventListener('seek-relative', handler);

    audioStore.seekRelative(-15);

    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail).toEqual({ seconds: -15 });

    audioStore.removeEventListener('seek-relative', handler);
  });

  it('tracks current tappa after playTappa', () => {
    const info = { src: '/audio/tappa3.mp3', titolo: 'Il Pozzo', numero: 3 };
    audioStore.playTappa(info);
    expect(audioStore.current).toEqual(info);
  });

  it('updates playing state via reportState', () => {
    audioStore.reportState(true, '/audio/tappa1.mp3');
    expect(audioStore.playing).toBe(true);

    audioStore.reportState(false, '/audio/tappa1.mp3');
    expect(audioStore.playing).toBe(false);
  });

  it('dispatches state-changed event on reportState', () => {
    const handler = vi.fn();
    audioStore.addEventListener('state-changed', handler);

    audioStore.reportState(true, '/audio/tappa2.mp3');

    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail).toEqual({ playing: true, src: '/audio/tappa2.mp3' });

    audioStore.removeEventListener('state-changed', handler);
  });
});
