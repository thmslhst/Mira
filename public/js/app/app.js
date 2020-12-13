// th0maslh0est

(function(){

  const socket = io.connect('http://localhost:8080');
  const emitter = new EventEmitter();
  const soundInjecter = new SoundInjecter();
  const midiInjecter = new MIDIInjecter(emitter);
  const gui = new GUI(emitter);
  const oscManager = new OSCManager(emitter, soundInjecter, midiInjecter, gui, socket);

  //------------------------------------------

  AnimationFrame.update(Date.now(), function(delta){
      oscManager.update();
      soundInjecter.drawMeter();
  });

})();
