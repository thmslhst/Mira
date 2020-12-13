/**
*
th0maslh0est
------------
*
**/

window.AudioContext = window.AudioContext || window.webkitAudioContext;

if(!navigator.getUserMedia)
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

class SoundInjecter{

    constructor(){

      var self = this;

      this.audioContext = new AudioContext();
      this.audioInput = null;
      this.realAudioInput = null;
      this.inputPoint = null;
      this.analyserContext = null;
      this.analyser = null;
      this.zeroGain = null;
      this.bufferLength = null;
      this.dataArray = [];

      this._fft = [];

      this.two = null;
      this.meterWidth = 0;
      this.meterHeight = 0;
      this.points = [];

      function gotStream(stream){

          self.inputPoint = self.audioContext.createGain();

          //

          self.realAudioInput = self.audioContext.createMediaStreamSource(stream);
          self.audioInput = self.realAudioInput;
          self.audioInput.connect(self.inputPoint);

          //

          self.analyser = self.audioContext.createAnalyser();
          self.analyser.smoothingTimeConstant = 0.3;
          //this.analyser.fftSize = 128;
          self.inputPoint.connect(self.analyser);

          //

          self.bufferLength = self.analyser.frequencyBinCount;

          //

          self.dataArray = new Uint8Array(self.bufferLength);

          //

          self.zeroGain = self.audioContext.createGain();
          self.zeroGain.gain.value = 0.0;
          self.inputPoint.connect(self.zeroGain);
          self.zeroGain.connect(self.audioContext.destination);

          // create meter points

          self.meter = document.getElementById('gui-meter');
          self.meterWidth = self.meter.offsetWidth;
          self.meterHeight = self.meter.offsetHeight;
          self.two = new Two({width: self.meterWidth, height: self.meterHeight}).appendTo(self.meter);

          for(var i = 0; i < self.bufferLength; i++){
              self.points[i] = self.two.makeCircle(i, self.meterHeight, 1);
              self.points[i].fill = '#FF9D5D';
              self.points[i].noStroke();
          }
      }

      navigator.getUserMedia({
          "audio": {
              "mandatory": {
                  "googEchoCancellation": "false",
                  "googAutoGainControl": "false",
                  "googNoiseSuppression": "false",
                  "googHighpassFilter": "false"
              },
              "optional": []
          }
      },
      gotStream,
      function(e){
          alert('Error getting audio');
          console.log(e);
      });

    }
    //-------------------------------------

    static getAverageVolume(array){
        var values = 0;
        var average;
        var length = array.length;
        // get all the frequency amplitudes
        for (var i = 0; i < length; i++) {
            values += array[i];
        }
        average = values / length;
        return average;
    }

    //-------------------------------------

    get fft(){
        if(this.analyser != null){
            this.analyser.getByteFrequencyData(this.dataArray);
            for(var i = 0; i < this.bufferLength; ++i){
                this._fft[i] = this.dataArray[i] / 255;
            }
        }
        return this._fft;
    }

    //-------------------------------------

    drawMeter(){
        if(this.analyser !== null && this.two !== null){
            for(var i = 0; i < this.bufferLength; i++){
                var y = (this.meterHeight + 1) - ((this.dataArray[i] / 255) * (this.meterHeight - 10));
                this.points[i].translation.set(i, y);
            }
            this.two.update();
        }
    }
}
