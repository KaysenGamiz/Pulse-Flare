// state.js
let latestLiveReading = null;

module.exports = {
  setLatestLiveReading: (data) => { latestLiveReading = data },
  getLatestLiveReading: () => latestLiveReading
};
