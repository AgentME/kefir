const {createStream, createProperty} = require('../patterns/one-source');
const {VALUE, END} = require('../constants');

function xformForObs(obs) {
  return {

    '@@transducer/step'(res, input) {
      obs._send(VALUE, input, obs._forcedCurrent);
      return null;
    },

    '@@transducer/result'(res) {
      obs._send(END, null, obs._forcedCurrent);
      return null;
    }

  };
}

const mixin = {

  _init({transducer}) {
    this._xform = transducer(xformForObs(this));
  },

  _free() {
    this._xform = null;
  },

  _handleValue(x, isCurrent) {
    this._forcedCurrent = isCurrent;
    if (this._xform['@@transducer/step'](null, x) !== null) {
      this._xform['@@transducer/result'](null);
    }
    this._forcedCurrent = false;
  },

  _handleEnd(_, isCurrent) {
    this._forcedCurrent = isCurrent;
    this._xform['@@transducer/result'](null);
    this._forcedCurrent = false;
  }

};

exports.TransduceStream = createStream('transduce', mixin);
exports.TransduceProperty = createProperty('transduce', mixin);