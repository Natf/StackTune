var MidiPlayer = require('midi-player-js');
var Player = new MidiPlayer.Player(function(event) {
    console.log(event);
});

process.argv.forEach(function (val, index) {
    if (index === 2) {
        Player.loadFile(`./${val}.mid`);
        Player.play();
    }
});

