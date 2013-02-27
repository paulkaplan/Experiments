  var gain = 1
  function hasGetUserMedia() {
    // Note: Opera is unprefixed.
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
  }

  function getMic() {
    if (hasGetUserMedia()) {
      var agent = navigator.userAgent;
      var isFireFox = (agent.indexOf("Firefox")> -1);
      var isOpera = (window.opera != null);
      var isIOS = agent.indexOf("iPod") > -1 || agent.indexOf("iPhone") > -1 || agent.indexOf("iPad") > -1;
      if (!isFireFox && !isOpera && !isIOS) {
        isBrowserSupported = true;
        context = new window.webkitAudioContext();
        gainNode = context.createGainNode();
        analyser = context.createAnalyser();
        gainNode.connect(analyser);

        navigator.webkitGetUserMedia({audio: true}, handleStream, handleError);
      } else {
        isBrowserSupported = false;
      }
    } else {
      isBrowserSupported = false;
    }
  }

  function handleStream(stream) {
    var microphone = context.createMediaStreamSource(stream);
    gainNode.gain.value = gain;
    microphone.connect(gainNode);
  }

  function setGain(gain){
    gainNode.gain.value = gain;
  }

function checkFlags() {
  if (this.micDetected) { return; }
  menu.showCheckFlags();
}

function handleError() {
  alert('webkitGetUserMedia threw exception');
}


function getAnalyserData() {
  freqData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freqData);
  var percent = ((max(freqData) - 128) / 128);
  percent = Math.max(0, Math.min(percent, 1));
  
  // this.micDetected = (percent > 0 || (this.micDetected==true)) ? true : false;
// console.log(percent)
  return percent;
}

function max (array) {
  var max = array[0];
  var len = array.length;
  for (var i = 0; i < len; ++i) {
    if (array[i] > max) {
      max = array[i];
    }
  }
  return max;
}