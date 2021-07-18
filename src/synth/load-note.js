// Load one mp3 file for one note.
// url = the base url for the soundfont
// instrument = the instrument name (e.g. "acoustic_grand_piano")
// name = the pitch name (e.g. "A3")
var soundsCache = require('./sounds-cache');
const { Asset } = require('../../../common/asset.ts');

var getNote = (url, instrument, name, audioContext) => {
  return new Promise(async (resolve) => {
    const buffer = await Asset.fetch(
      `midi-js-soundfonts/${instrument}-mp3/${name}.mp3`,
      false,
      false
    );
    const audioBuffer = await audioContext.decodeAudioData(buffer);
    soundsCache[instrument] = soundsCache[instrument] || {};
    soundsCache[instrument][name] = audioBuffer;
    return resolve();
  });
};

module.exports = getNote;
