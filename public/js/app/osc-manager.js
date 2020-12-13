class OSCManager{

  constructor(emitter, soundInjecter, midiInjecter, gui, socket){

    let self = this;

    //---------------------------------------

    this.BASE_URL = '/mira';

    //---------------------------------------

    this.soundInjecter = soundInjecter;
    this.midiInjecter = midiInjecter;
    this.gui = gui;
    this.socket = socket;

    this.heardSomething = false;

    //---------------------------------------

    emitter.on('midinoteon', function(message){
      self.emitMIDINote('/midi', message);
    });

    emitter.on('midinoteoff', function(message){
      self.emitMIDINote('/midi', message);
    });
  }

  //---------------------------------------

  emitMIDINote(address, message){
    this.socket.emit('osc-sent', {
        address: this.BASE_URL + address,
        args: [
            message.device,
            message.status,
            message.note,
            message.velocity
        ]
    });
  }

  //---------------------------------------

  emitFFT(){
    for(var i = 0; i < this.soundInjecter.fft.length; i++) {
      if(this.soundInjecter.fft[i] > 0){

        this.socket.emit('osc-sent', {
            address: this.BASE_URL + '/sound/fft',
            args: this.soundInjecter.fft
        });

        this.heardSomething = true;

      } else {

        if(this.heardSomething){
          this.socket.emit('osc-sent', {
              address: this.BASE_URL + '/sound/fft',
              args: [0, 0, 0, 0, 0, 0, 0]
          });
          this.heardSomething = false;
        }
      }
    }
  }

  //---------------------------------------

  update(){
    this.emitFFT();
  }
}
