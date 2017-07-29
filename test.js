const scribble = require('scribbletune');

let cMajor = scribble.clip({
	notes: ['c4'],
	pattern:'x-x-x-x-x-x-x-'
});

scribble.midi(cMajor, 'test.mid');
