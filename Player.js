import loopWithDelay from './functions/LoopWithDelay'
import formatString from './functions/FormatString'

export default class Player {
    constructor() {
        this.player = $('#player');
    }

    initVars() {
        this.maxNotes = 30;
        this.speed = 30;
        this.loop = null;
        this.instrumentsToLoad = [
            'acoustic_grand_piano', 'accordion', 'flute', 'electric_guitar_clean', 'gunshot', 'synth_drum', 'tinkle_bell',
            'acoustic_guitar_steel', 'acoustic_guitar_nylon', 'alto_sax', 'cello', 'church_organ', 'electric_guitar_jazz',
            'fiddle', 'french_horn', 'recorder', 'synth_strings_1', 'trumpet', 'xylophone', 'whistle'
        ];
        this.pitchStart = 22;
        this.pitchEnd = 109;
        this.noteTypes = ['single', 'continuous', 'chord'];
        this.noteType = 0;
        this.playerControls = $('#player-controls');
        this.playBoards = $('div.player-container');
    }

    init() {
        if (typeof(this.player) !== 'undefined') {
            this.initVars();
            this.loadBoards();
            this.initControls();
            this.bindNoteCellClicks();
            this.mainLoop(0);
        }
    }

    initControls() {
        this.initInstrumentsSelect();
        this.initDirtyLoadSave();
        this.initNoteType();
        this.initColumnControls();
        this.initPlaybackControls();
    }

    initPlaybackControls() {
        let playSpeed = $('#play-speed');
        let pausePlay = $('#pause-play');
        playSpeed.val(this.speed);

        playSpeed.on('change', () => {
            this.speed = playSpeed.val();
        });

        pausePlay.on('click', function () {
            if (pausePlay.attr('data-action') === 'pause') {
                clearTimeout(loop);
            } else {
                this.mainLoop(0)
            }

            $(this).attr('data-action', ((pausePlay.attr('data-action') === 'play') ? 'pause' : 'play'))
            pausePlay.text(formatString(pausePlay.attr('data-action')))
        })
    }

    initColumnControls() {
        $('#add-column').on('click', () => {
            this.addNote();
        })

        $('#delete-column').on('click', () => {
            this.playBoards.children(':last-child').remove()
            this.maxNotes = $(this.playBoards.get(0)).children().length - 1
        })
    }

    initNoteType() {
        let noteButton = $('#note-type');

        noteButton.on('click', () => {
            if (++this.noteType >= this.noteTypes.length) {
                this.noteType = 0;
            }

            $(this).attr('data-type', this.noteTypes[this.noteType]);
        });
    }

    initInstrumentsSelect() {
        let select = $('<select data-instrument="acoustic_grand_piano">');

        for (let i = 0; i < this.instrumentsToLoad.length; i++) {
            let option = $(`<option value="${this.instrumentsToLoad[i]}">`);

            option.text(formatString(instrument));
            select.append(option);
        }

        select.on('change', () => {
            select.attr('data-instrument', select.find("option:selected").attr('value'));
        });

        this.playerControls.append(select)
    }

    initDirtyLoadSave() {
        let dirtyLoad = $('#dirty-load');

        dirtyLoad.on('change', () => {
            if (('files' in dirtyLoad) && (dirtyLoad.files.length !== 0)) {
                let fileReader = new FileReader();
                fileReader.onload = (fileLoadedEvent) => {
                    this.player.html(fileLoadedEvent.target.result);
                    this.maxNotes = this.player.children('.player-container').children().length - 1;
                    this.bindNoteCellClicks();
                };
                fileReader.readAsText(dirtyLoad.files[0]);
            }
        });

        $('#dirty-save').on('click', function () {
            let content = this.player.html();
            this.download(content, 'song.txt', 'text/plain');
        })
    }

    addNote() {
        let noteCell = $('<div class="player-note">');

        $(noteCell).on('click', function () {
            $(this).attr('data-instrument', $('#selected-instrument').attr('data-instrument'));

            if ($(this).attr('data-play') === "play") {
                $(this).removeAttr('data-play');
                $(this).removeAttr('data-instrument');
                $(this).text('')
            } else {
                $(this).attr('data-play', 'play');
                $(this).attr('data-type', this.noteTypes[this.noteType]);
            }

            this.triggerNote($(this), $(this).parent('.player-container').attr('data-pitch'));
        });

        if (($(this.playBoards.get(0)).children('.player-note').length) % 10 === 0) {
            let highlight = $(`<div class="highlight">`);
            highlight.text('highlight');
            noteCell.append(highlight);
        }

        this.playBoards.append(noteCell);
        this.maxNotes = $(this.playBoards.get(0)).children('.player-note').length;
    }

    playNote(instrument, pitch, volume = 127, strength = 50, off = 0.3, isChord = false) {
        MIDI.programChange(0, MIDI.GM.byName[instrument].number);
        MIDI.setVolume(0, volume);
        if (isChord) {
            MIDI.chordOn(0, [pitch - 12, pitch, pitch + 12], strength, 0);
            MIDI.chordOff(0, [pitch - 12, pitch, pitch + 12], off);
        } else {
            MIDI.noteOn(0, pitch, strength, 0);
            MIDI.noteOff(0, pitch, off);
        }
    }

    function

    triggerNote(currentNote, pitch) {
        let instrument = (currentNote.attr('data-instrument') === '') ? 'acoustic_grand_piano' : currentNote.attr('data-instrument');
        if (typeof(instrument) == "undefined") {
            instrument = 'acoustic_grand_piano'
        }

        if (currentNote.attr('data-play') === 'play') {
            currentNote.text(instrument)
        }

        if (currentNote.attr('data-type') === 'single') {
            playNote(instrument, pitch, 127, 127)
        } else if (currentNote.attr('data-type') === 'continuous') {
            playNote(instrument, pitch, 127, 127, 3)
        } else if (currentNote.attr('data-type') === 'chord') {
            playNote(instrument, pitch, 127, 127, 0.5, true)
        }
    }

    mainLoop(note) {           //  create a loop function
        console.log('loop' + note)
        loop = setTimeout(function () {    //  call a 3s setTimeout when the
            note = (note >= maxNotes) ? 0 : note;
            console.log(maxNotes)
            let playBoards = $('.player-container')
            let drumBoards = $('.drums-container');

            playBoards.each(function () {
                let noteCells = $(this).children('.player-note')
                let currentNote = $(noteCells.get(note))
                noteCells.removeClass('current-note')
                currentNote.addClass('current-note')

                if (currentNote.attr('data-play') === "play") {
                    triggerNote(currentNote, $(this).attr('data-pitch'))
                }
            })

//                drumBoards.each(function () {
//                    let noteCells = $(this).children('.player-note')
//                    let currentNote = $(noteCells.get(note))
//                    noteCells.removeClass('current-note')
//                    currentNote.addClass('current-note')
//
//                    if (currentNote.attr('data-play') === "play") {
//                        console.log('play drums')
//                        playNote(instruments.drums, $(this).attr('data-pitch'))
//                    }
//                })
            mainLoop(++note);
        }, speed)
    }

    function

    loadBoards() {
        let noteLetters = ['a', 'a#', 'b', 'c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#']
        noteLetters.reverse()

        for (let i = pianoStart; i < pianoEnd; i++) {
            let pitch = i;
            console.log('adding note with pitch ' + pitch)
            let noteLetter = $('<div class="note-letter">')
            noteLetter.text(noteLetters[i % noteLetters.length])

            let playBoard = $(`<div class="player-container" data-pitch="${pitch}">`)
            playBoard.append(noteLetter)
            playBoard.addClass('note-' + ((noteLetter.text().indexOf('#') !== -1) ? 'sharp' : 'normal'))

            $('div#player').append(playBoard)
        }

        let playBoards = $('div.player-container')

        playBoards.each(function () {
            for (let i = 0; i < maxNotes; i++) {
                console.log('adding note tile')
                let noteCell = $('<div class="player-note">')
                let highlight = $(`<div class="highlight">`)
                highlight.text($(this).children('.note-letter').text())
                if (($(this).children('.player-note').length + 1) % 10 === 0) {
                    console.log('highlight')
                    noteCell.append(highlight)
                }
                $(this).append(noteCell)
            }
        })

        let drumBoards = $('div.drums-container')
        drumBoards.each(function () {
            for (let i = 0; i < maxNotes; i++) {
//                    addNote()
            }
        })
    }

//        function addNote() {
//            let noteCell = $('<div class="player-note">')
//            let highlight = $(`<div class="highlight">`)
//            highlight.text($(this).children('.note-letter').text())
//
//            let noteCells = $(this).children('.player-note').length
//            if ((noteCells + 1) % 10 === 0) {
//                noteCell.append(highlight)
//            }
//            noteCell.attr('data-type', noteType)
//            $(this).append(noteCell)
//        }

    function

    bindNoteCellClicks() {
        let noteCells = $('div.player-note')

        noteCells.each(function (index, note) {
            $(note).on('click', function () {
                $(this).attr('data-instrument', $('#selected-instrument').attr('data-instrument'))
                if ($(this).attr('data-play') === "play") {
                    $(this).removeAttr('data-instrument')
                    $(this).contents().filter(function () {
                        return this.nodeType === 3;
                    }).remove()
                    $(this).removeAttr('data-play')
                } else {
                    $(this).attr('data-play', 'play')
                    $(this).attr('data-type', noteType)
                }
                triggerNote($(this), $(this).parent('.player-container').attr('data-pitch'))
            })
        })
    }

    function

    registerLoadedInstrument() {
        console.log('register')
        instrumentsToLoad--;
        if (instrumentsToLoad <= 0) {
            console.log('loaded instruments')
            start()
//                function loop(count) {
//                    setTimeout(function () {
//                            console.log(count)
//                            instruments.drums.setVolume(0, 127);
//                            instruments.drums.noteOn(0, count, 127, 0);
//                            instruments.drums.noteOff(0, count, 0.75);
//                            if (--count) {
//                                loop(count)
//                            }
//                    }, 500)
//                }
//
//                loop(100)
        }
    }

    function

    loadDrums(url, instrument) {
        MIDI.loadPlugin({
            soundfontUrl: url,
            instrument: instrument,
            onsuccess: function () {
                instruments.drums = MIDI
                registerLoadedInstrument()
            }
        });
    }

    function

    loadPiano(url, instrument) {
//            MIDI.loadPlugin({
//                soundfontUrl: url,
//                instrument: instrument,
//                onsuccess: function () {
////                    instruments.piano = MIDI
//                    registerLoadedInstrument()
//                }
//            });

        MIDI.loadPlugin({
            soundfontUrl: "./midi-js-soundfonts/MusyngKite/",
            instruments: instrumentNamesToLoad,
            onprogress: function (state, progress) {
                console.log("loading...", state, progress);
            },
            onsuccess: function () {
                console.log(MIDI)
//                    MIDI.programChange(0, MIDI.GM.byName['electric_guitar_clean'].number);
//                    instruments.piano = MIDI.getInstrument('electric_guitar_clean')
                registerLoadedInstrument()
            }
        });
    }

    function

    download(data, filename, type) {
        var file = new Blob([data], {type: type});
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    else
        { // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
        }
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
    }

//        loadDrums("MIDI.js/examples/soundfont/", "synth_drum")
    loadPiano(

    "http://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/accordion-mp3.js"
,
    "accordion"
)
}