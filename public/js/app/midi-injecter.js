class MIDIInjecter{

    constructor(emitter){

        var self = this;

        //--------------------

        this._message = {
            note: 0,
            velocity: 0
        };

        this._midiDevices = [];

        //--------------------

        if(navigator.requestMIDIAccess){
            navigator.requestMIDIAccess({
                sysex: false
            }).then(onMIDISuccess, onMIDIFailure);
        } else {
            alert("No MIDI support in your browser.");
        }

        //--------------------

        function onMIDISuccess(midiAccess){

            let inputs = midiAccess.inputs.values();

            for(let input = inputs.next(); input && !input.done; input = inputs.next()){

                self._midiDevices.push(input.value.name);
                //console.log('%c ♫ - MIDI device detected --> ' + input.value.name + ' ', 'background: #FF9D5D; color: #43005D');

                input.value.onmidimessage = function(message){

                    // status byte : data[0]

                    let data = message.data;

                    let noteOff = data[0] >= 128 && data[0] <= 143;
                    let noteOn = data[0] >= 144 && data[0] <= 159;

                    let note = data[1];
                    let normVelocity = data[2] / 124;

                    if(noteOn){

                        self._message = {
                            device: input.value.name,
                            status : 'Note On',
                            note: note,
                            velocity: normVelocity
                        };

                        emitter.emit('midinoteon', self._message);

                    } else if(noteOff) {

                        self._message = {
                            device: input.value.name,
                            status : 'Note Off',
                            note: note,
                            velocity: 0
                        };

                        emitter.emit('midinoteoff', self._message);
                    }
                };

                emitter.emit('midiready', self._midiDevices);
            }
        }

        //--------------------

        function onMIDIFailure(error){
            console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + error);
        }
    }

    //------------------------------------------

    get message(){
        return this._message;
    }

    get midiDevices(){
        return this._midiDevices;
    }
}
