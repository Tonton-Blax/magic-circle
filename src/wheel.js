import pianissimo from 'pianissimo';

export default {
    gamut : 12,
    interval : 'P5',
    order : '+',
    fundamental : 'C0',
    relative : 'C0',
    _scales : [[],[]],

    _wheel : [[],[]],

    // Basic Getters and Setters.
    // wIdx arg passed  in most funcs is the "wheel index"
    // Two wheels = two scales, two series of similar datam, therefore most data is stored in bi-dimensiona arrays

    _tones : [
        ['C','G','D','A','E','B','Gb','Db', 'Ab','Eb','Bb','F'],
        ['C','G','D','A','E','B','F#','C#','G#','D#','A#','F']
   ],


    setWheel (fun, wIdx, flavor)
    {
        this._wheel[wIdx] = [];
        let x = this.order == '+' ? 0 : 4;
        this._wheel[wIdx][0]=(pianissimo.note(fun || this.fundamental));
        for (let i = 1; i < (this.gamut); i++) {
            //this._wheel[wIdx][i] = this._wheel[wIdx][i-1].plusInterval(this.interval, this.order);
            this._wheel[wIdx][i] = pianissimo.note(`${this._tones[flavor][i]}${x}`)
        }
    },

    get wheel () {
        return this._wheel;
    },

    get scale() {
        return this._scales;
    },

    setScale (tonic, scale, mode, wIdx) {
        this._scales[wIdx] = pianissimo.scale(tonic, scale, mode);
        return this._scales[wIdx];
    },

    // matchAbcString (scale)
    // translates notes from a pianisimmo scale array to abc notation to be processed by staff and synth

    matchAbcString (scale)
    {
        let abcScale = []; let length; let extraChar = '';
        length = scale.length;
        for (let i = 0; i < length; i++) {

            abcScale[i] = scale[i].getRootName().toUpperCase();

            switch ( scale[i].getOctave() ) {

                case 2:
                    extraChar=","; break;
                case 3:
                    extraChar=""; break;
                case 4:
                    abcScale[i]=abcScale[i].toLowerCase(); break;
                case 5:
                   extraChar="'";break;
                default : extraChar;
            }

            switch (scale[i].getAlteration()) {

                case '#' :
                    abcScale[i] = `^${abcScale[i]}${extraChar}`;break;
                case '##' :
                        abcScale[i] = `^^${abcScale[i]}${extraChar}`;break;
                case 'b' :
                    abcScale[i] = `_${abcScale[i]}${extraChar}`;break;
                case 'bb' :
                    abcScale[i] = `__${abcScale[i]}${extraChar}`;break;
                default : `${abcScale[i]}${extraChar}`;
            }
        }

        return abcScale;
    },

    // matchAbc (scale)
    // translates notes from a pianisimmo Object (scale or Chord) to abc notation to be processed by staff and synth

    matchAbc (scale)
    {
        let abcScale = [];
        let extraChar = '';

        const length = (scale.scale || scale.getNotesName()).length;

        for (let i = 0; i < length; i++) {

            abcScale[i] = scale.getNotes()[i].getRootName().toUpperCase();

            switch ( scale.getNotes()[i].getOctave() ) {

                case 2:
                    extraChar=","; break;
                case 3:
                    extraChar=""; break;
                case 4:
                    abcScale[i]=abcScale[i].toLowerCase(); break;
                case 5:
                   extraChar="'";break;
                default : extraChar;
            }

            switch (scale.getNotes()[i].getAlteration()) {

                case '#' :
                    abcScale[i] = `^${abcScale[i]}${extraChar}`;break;
                case '##' :
                        abcScale[i] = `^^${abcScale[i]}${extraChar}`;break;
                case 'b' :
                    abcScale[i] = `_${abcScale[i]}${extraChar}`;break;
                case 'bb' :
                    abcScale[i] = `__${abcScale[i]}${extraChar}`;break;
                default : `${abcScale[i]}${extraChar}`;
            }
        }

        return abcScale;
    },

    palette : { main :'#006989', tonic: '#C43835', out: '#2D3336', chord: '#084' },

    _colors : [[],[]],
    _names : [[],[]],
    _chordsStrings : [[],[]],
    _chords3: [],
    _chords4: [],
    _chords5: [],
    _scaleDelta : [[],[]],
    placeHolder : "off-scale root",

    // matchWheel (wIdx)
    // sets the above props of a given wheel according to scales previously set

    matchWheel (wIdx)
    {
        this._colors[wIdx] = []; this._names[wIdx] = []; this._chordsStrings[wIdx] = []; this._scaleDelta[wIdx]=[];
        this._chords3[wIdx] = []; this._chords4[wIdx] =  []; this._chords5[wIdx] =  []

        for (let i = 0; i < this._wheel[wIdx].length ; i++) { // Global Data Pre-fill
            this._colors[wIdx].push(this.palette.out);
            this._names[wIdx].push(this._wheel[wIdx][i].getRoot());
            this._chordsStrings[wIdx].push(this.placeHolder);
        }

        this._chords3[wIdx] = this._scales[wIdx].getChords(3);
        this._chords4[wIdx] = this._scales[wIdx].getChords(4);
        this._chords5[wIdx] = this._scales[wIdx].getChords(5);

        if (this._wheel[wIdx].length &&  this._scales[wIdx].getNotes().length) {
            for (let x = 0; x <  this._scales[wIdx].getNotes().length; x++) {
                for (let i = 0; i < this._wheel[wIdx].length ; i++) {

                    // Checks for enharmonics via MIDI :
                    if (( this._scales[wIdx].getNotes()[x].getMidiNumber() - this._wheel[wIdx][i].getMidiNumber()) % 12 == 0) {
                        x == 0 ? this._colors[wIdx][i] = this.palette.tonic : this._colors[wIdx][i] = this.palette.main;
                        this._names[wIdx][i] =  this._scales[wIdx].getNotes()[x].getRoot();
                        this._chordsStrings[wIdx][i] =
                        (`${this._chords3[wIdx][x].findBestName()} , ${this._chords4[wIdx][x].findBestName()} , ${this._chords5[wIdx][x].findBestName()}`);
                        this._scaleDelta[wIdx][i] = x;
                    }
                }
            }
        } else {
            throw new Error("Define a Scale first. Also check if wheel notes are defined");
        }

        return {
            colors : this._colors[wIdx],
            names : this._names[wIdx],
            chords : this._chordsStrings[wIdx],
            delta : this._scaleDelta[wIdx]
        };
    },

    get _chords () {
        return {1 : this._chords3, 2: this._chords4};
    },

    _degrees : [ [],[] ],
    roman : ['I','II','III','IV','V','VI','VII','VIII'],

    // matchDegrees (scale, wIdx)
    // returns convential scale roman degrees

    matchDegrees (scale, wIdx) {

        this._degrees[wIdx] = [];
        if (!scale.scale.length) throw new Error ("You probably didn't pass a Scale Object.");
        let length = scale.scale.length;

        for (let i = 0; i < length ; i++) {
            this._degrees[wIdx][i] = scale.getNotes()[i].toInterval(scale.getNotes()[(i+2)%length]);
            if (this._degrees[wIdx][i].getSemitones() < 0) {this._degrees[wIdx][i] = this._degrees[wIdx][i].invert();}
            this._degrees[wIdx][i] = this._degrees[wIdx][i].getQuality();
            this._degrees[wIdx][i] == 'm' ?
                this._degrees[wIdx][i] = `${this.roman[i].toLowerCase()}\xa0${this._degrees[wIdx][i]}`
                :this._degrees[wIdx][i] = `${this.roman[i]}\xa0${this._degrees[wIdx][i]}`;
        }
        return this._degrees[wIdx];
    },

    digiPitches : ['C','D','E','F','G','A','B','C','D','E','F','G','A','B','C','D','E','F','G','A','B','C'],
    accidentals : {"sharp" : "#", "flat" : "b", "dblflat" : "bb", "dblsharp" : "##"},

    // matchColorsFromStaff (pitches, wIdx)
    // sets new colors for a given wheel matching a previously selected chord from staff
    // (pitches = array of note(s) index from 0 returned from abc Synth)

    matchColorsFromStaff (pitches, wIdx) {
       let notes = []; let newColors=[];

        for (let i = 0; i < pitches.length ; i++) {
             notes[i] = this.digiPitches[pitches[i][0]] + (this.accidentals[pitches[i][1]] || '');
        }

            newColors = [...this._colors[wIdx]];
            notes.forEach(note => newColors[this._names[wIdx].indexOf(note)] = this.palette.chord);

        return newColors;
    },

    alterRootDic : {

        'B#'  : 'C' ,
        'E#'  : 'F' ,
        'C##' : 'D' ,
        'D##' : 'E' ,
        'E##' : 'F',
        'F##' : 'G' ,
        'G##' : 'A' ,
        'A##' : 'B' ,
        'B##' : 'C',
        'Cbb' : '#',
        'Dbb' : 'C',
        'Ebb' : 'D',
        'Fbb' : 'D',
        'Gbb' : 'F',
        'Abb' : 'G',
        'Bbb' : 'A',
        'Fb'  : 'E',
        'Cb'  : 'B'
      },

      alterAltDic : {

        'B#'  : '' ,
        'E#'  : '' ,
        'C##' : '' ,
        'D##' : '' ,
        'E##' : '#',
        'F##' : '' ,
        'G##' : '' ,
        'A##' : '' ,
        'B##' : '#',
        'Cbb' : '#',
        'Dbb' : '',
        'Ebb' : '',
        'Fbb' : '#',
        'Gbb' : '' ,
        'Abb' : '',
        'Bbb' : ''
      },

      flatDic : {

          'Ab' : 'G',
          'Bb' : 'A',
          'Cb' : 'B',
          'Db' : 'C',
          'Eb' : 'D',
          'Fb' : 'E',
          'Gb' : 'F'
      },

      flatAltDic : {

          'Ab' : '#',
          'Bb' : '#',
          'Cb' : '',
          'Db' : '#',
          'Eb' : '#',
          'Fb' : '',
          'Gb' : '#'
      },

      chordDic : {

        'Δ'     : 'maj7',
        'm'     : 'minor',
        'ø'     : 'dim7',
        'mΔ'    : 'mmaj7',
        '+'     : 'aug',
        '+Δ'    : 'maj7#5',
        'mΔ♭5'  : 'mmaj7b5',
        '7♭5'   : '7b5',
        '♭5'    : 'dim',
        'dim6'  : 'dim7',
        '+add1' : 'aug7',
    'no5add♭6'  : 'aug7',
        '/Ab'   : '/G#',
        '/Bb'   : '/A#',
        '/Db'   : '/C#',
        '/Eb'   : '/D#',
        '/Gb'   : '/F#',
        'm/Ab'  : 'm/G#',
        'm/Bb'  : 'm/A#',
        'm/Db'  : 'm/C#',
        'm/Eb'  : 'm/D#',
        'm/Gb'  : 'm/F#',
      },

      chordRootDic : {
        'C#'     :   'Csharp',
        'D#'     :   'Eb',
        'E#'     :   'F',
        'F#'     :   'Fsharp',
        'G#'     :   'Ab',
        'A#'     :   'Bb',
        'B#'     :   'C',
        'Cb'     :   'B',
        'Db'     :   'Csharp',
        'Eb'     :   'Eb',
        'Fb'     :   'E',
        'Gb'     :   'Fsharp',
        'Ab'     :   'Ab',
        'Bb'     :   'Bb'
      }
};
