import Ember from 'ember';
import Sound from './sound';
import zeroify from './zeroify';


/**
 * A class that represents a "track" of music, similar in concept to a track on
 * a CD or an MP3 player. Provides methods for tracking the play position of the
 * underlying
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer AudioBuffer},
 * and pausing/resuming.
 *
 * <style>
 *   .ignore-this--this-is-here-to-hide-constructor,
 *   #Track { display: none; }
 * </style>
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer}
 * @class Track
 * @extends Sound
 */
const Track = Sound.extend({
  position: Ember.computed('startOffset', function() {
    const startOffset = this.get('startOffset');
    let minutes = Math.floor(startOffset / 60);
    let seconds = startOffset - (minutes * 60);

    return {
      raw: startOffset,
      string: `${zeroify(minutes)}:${zeroify(seconds)}`,
      pojo: { minutes, seconds }
    };
  }),

  percentPlayed: Ember.computed('duration', 'startOffset', function() {
    const ratio = this.get('startOffset') / this.get('duration.raw');
    return ratio * 100;
  }),

  watchPosition: Ember.observer('isPlaying', function() {
    const ctx = this.get('audioContext');
    const startOffset = this.get('startOffset');
    const startedPlayingAt = this.get('startedPlayingAt');

    const animate = () => {
      if (this.get('isPlaying')) {
        this.set('startOffset', startOffset + ctx.currentTime - startedPlayingAt);
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }),

  play() {
    this._super();
    this.get('bufferSourceNode').onended = () => this.stop();
  },

  pause() {
    if (this.get('isPlaying')) {
      this.get('bufferSourceNode').onended = function() {};
      this.get('bufferSourceNode').stop();
      this.set('isPlaying', false);
    }
  },

  stop() {
    this.set('startOffset', 0);

    if (this.get('isPlaying')) {
      this.get('bufferSourceNode').onended = function() {};
      this._super();
    }
  },
});

export default Track;
