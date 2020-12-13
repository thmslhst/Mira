class GUI{

    constructor(emitter){

        var self = this;
        this._settings = null;

        //---------------------------------------

        angular.module('GUI', [])
            .controller('GUIController', ['$scope', function($scope){

                $scope.settings = {};
                $scope.presetsCollection = [];

                $scope.displaySaveModal = false;
                $scope.displayPresets = false;

                $scope.newPresetName = '';
                $scope.lastPresetsLoaded = 0;

                $scope.midiDevices = [];
                $scope.notesOn = [];

                //--------------------------------------------------

                if(localStorage.getItem('presetsCollection') != null){

                    if(localStorage.getItem('lastPresetsLoaded') != null){
                        $scope.lastPresetsLoaded = localStorage.getItem('lastPresetsLoaded');
                    }

                    var pc = localStorage.getItem('presetsCollection');
                    $scope.presetsCollection = JSON.parse(pc);

                    this._settings = $scope.settings = angular.copy($scope.presetsCollection[$scope.lastPresetsLoaded].data);

                } else {

                    function loadJSON(callback){
                        var xobj = new XMLHttpRequest();
                        xobj.overrideMimeType("application/json");
                        xobj.open('GET', 'presets/p0.json', true);
                        xobj.onreadystatechange = function(){
                            if (xobj.readyState == 4 && xobj.status == "200"){
                                callback(xobj.responseText);
                            }
                        };
                        xobj.send(null);
                    }
                    loadJSON(function(p){
                        $scope.$apply(function(){
                            self._settings = $scope.settings = JSON.parse(p);
                        });
                    });
                }

                //--------------------------------------------------

                emitter.on('midiready', function(midiDevices){
                    $scope.$apply(function(){
                        $scope.midiDevices = midiDevices;
                    });
                });

                emitter.on('midinoteon', function(message){
                    $scope.$apply(function(){
                        let index = $scope.midiDevices.indexOf(message.device);
                        $scope.notesOn[index] = true;
                        $scope.note = message.note;
                        $scope.velocity = message.velocity;
                    });
                });

                emitter.on('midinoteoff', function(message){
                    $scope.$apply(function(){
                        let index = $scope.midiDevices.indexOf(message.device);
                        $scope.notesOn[index] = false;
                        $scope.note = '';
                        $scope.velocity = '';
                    });
                });

                //--------------------------------------------------

                $scope.deletePresets = function(presetsKey){
                    var c = confirm('Delete preset ?');
                    if(c){
                        $scope.presetsCollection.splice(presetsKey, 1);
                        var pc = angular.toJson($scope.presetsCollection);
                        localStorage.setItem('presetsCollection', pc);

                        if($scope.lastPresetsLoaded >= $scope.presetsCollection.length){
                            $scope.lastPresetsLoaded = 0;
                            localStorage.setItem('lastPresetsLoaded', $scope.lastPresetsLoaded);
                        }

                        if($scope.presetsCollection.length == 0){
                            localStorage.removeItem('presetsCollection');
                        }
                    }
                };

                //--------------------------------------------------

                $scope.loadPresets = function(presetsKey){

                    $scope.lastPresetsLoaded = presetsKey;
                    localStorage.setItem('lastPresetsLoaded', $scope.lastPresetsLoaded);

                    self._settings = $scope.settings = angular.copy($scope.presetsCollection[$scope.lastPresetsLoaded].data);
                };

                //--------------------------------------------------

                $scope.saveSettings = function(){

                    $scope.presetsCollection.push({
                        name: $scope.newPresetName,
                        data: angular.copy($scope.settings)
                    });

                    //

                    var pc = angular.toJson($scope.presetsCollection);
                    localStorage.setItem('presetsCollection', pc);

                    //

                    $scope.displaySaveModal = false;
                    $scope.newPresetName = '';
                };

                //--------------------------------------------------

                $scope.toggleControl = function(groupKey,controlKey, active){
                    self._settings[groupKey].controls[controlKey].active = active;
                };

                //--------------------------------------------------

                $scope.updateControl = function(groupKey, controlKey, value){
                    self._settings[groupKey].controls[controlKey].value = value;
                };

                //--------------------------------------------------

                $scope.showModal = function(target){
                    if(target == 'save'){
                        $scope.displaySaveModal = true;
                        $scope.displayPresets = false;
                    } else if(target == 'presets'){
                        if($scope.displayPresets){
                            $scope.displayPresets = false;
                        } else {
                            $scope.displayPresets = true;
                        }
                        $scope.displaySaveModal = false;
                    } else if(target == 'close'){
                        $scope.displayPresets = false;
                        $scope.displaySaveModal = false;
                    }
                };
            }]);
    }

    get settings(){
        return this._settings;
    }
}
