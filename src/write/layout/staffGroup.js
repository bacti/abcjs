var layoutVoiceElements = require('./VoiceElements');

var layoutStaffGroup = function(spacing, renderer, debug, staffGroup, leftEdge) {
	var epsilon = 0.0000001; // Fudging for inexactness of floating point math.
	var spacingunits = 0; // number of times we will have ended up using the spacing distance (as opposed to fixed width distances)
	var minspace = 1000; // a big number to start off with - used to find out what the smallest space between two notes is -- GD 2014.1.7

	var x = leftEdge;
	staffGroup.startx=x;
	var i;

	var currentduration = 0;
	if (debug) console.log("init layout", spacing);
	for (i=0;i<staffGroup.voices.length;i++) {
		layoutVoiceElements.beginLayout(x, staffGroup.voices[i]);
	}

	var spacingunit = 0; // number of spacingunits coming from the previously laid out element to this one
	while (!finished(staffGroup.voices)) {
		// find first duration level to be laid out among candidates across voices
		currentduration= null; // candidate smallest duration level
		for (i=0;i<staffGroup.voices.length;i++) {
			if (!layoutVoiceElements.layoutEnded(staffGroup.voices[i]) && (!currentduration || getDurationIndex(staffGroup.voices[i])<currentduration))
				currentduration=getDurationIndex(staffGroup.voices[i]);
		}


		// isolate voices at current duration level
		var currentvoices = [];
		var othervoices = [];
		for (i=0;i<staffGroup.voices.length;i++) {
			var durationIndex = getDurationIndex(staffGroup.voices[i]);
			// PER: Because of the inexactness of JS floating point math, we just get close.
			if (durationIndex - currentduration > epsilon) {
				othervoices.push(staffGroup.voices[i]);
				//console.log("out: voice ",i);
			} else {
				currentvoices.push(staffGroup.voices[i]);
				//if (debug) console.log("in: voice ",i);
			}
		}

		// among the current duration level find the one which needs starting furthest right
		spacingunit = 0; // number of spacingunits coming from the previously laid out element to this one
		var spacingduration = 0;
		for (i=0;i<currentvoices.length;i++) {
			//console.log("greatest spacing unit", x, currentvoices[i].getNextX(), currentvoices[i].getSpacingUnits(), currentvoices[i].spacingduration);
			if (layoutVoiceElements.getNextX(currentvoices[i])>x) {
				x=layoutVoiceElements.getNextX(currentvoices[i]);
				spacingunit=layoutVoiceElements.getSpacingUnits(currentvoices[i]);
				spacingduration = currentvoices[i].spacingduration;
			}
		}
		spacingunits+=spacingunit;
		minspace = Math.min(minspace,spacingunit);
		if (debug) console.log("currentduration: ",currentduration, spacingunits, minspace);

		for (i=0;i<currentvoices.length;i++) {
			var voicechildx = layoutVoiceElements.layoutOneItem(x,spacing, currentvoices[i], renderer.minPadding);
			var dx = voicechildx-x;
			if (dx>0) {
				x = voicechildx; //update x
				for (var j=0;j<i;j++) { // shift over all previously laid out elements
					layoutVoiceElements.shiftRight(dx, currentvoices[j]);
				}
			}
		}

		// remove the value of already counted spacing units in other voices (e.g. if a voice had planned to use up 5 spacing units but is not in line to be laid out at this duration level - where we've used 2 spacing units - then we must use up 3 spacing units, not 5)
		for (i=0;i<othervoices.length;i++) {
			othervoices[i].spacingduration-=spacingduration;
			layoutVoiceElements.updateNextX(x,spacing, othervoices[i]); // adjust other voices expectations
		}

		// update indexes of currently laid out elems
		for (i=0;i<currentvoices.length;i++) {
			var voice = currentvoices[i];
			layoutVoiceElements.updateIndices(voice);
		}
	} // finished laying out


	// find the greatest remaining x as a base for the width
	for (i=0;i<staffGroup.voices.length;i++) {
		if (layoutVoiceElements.getNextX(staffGroup.voices[i])>x) {
			x=layoutVoiceElements.getNextX(staffGroup.voices[i]);
			spacingunit=layoutVoiceElements.getSpacingUnits(staffGroup.voices[i]);
		}
	}
	//console.log("greatest remaining",spacingunit,x);
	spacingunits+=spacingunit;
	staffGroup.setWidth(x);

	return { spacingUnits: spacingunits, minSpace: minspace };
};


function finished(voices) {
	for (var i=0;i<voices.length;i++) {
		if (!layoutVoiceElements.layoutEnded(voices[i])) return false;
	}
	return true;
}

function getDurationIndex(element) {
	return element.durationindex - (element.children[element.i] && (element.children[element.i].duration>0)?0:0.0000005); // if the ith element doesn't have a duration (is not a note), its duration index is fractionally before. This enables CLEF KEYSIG TIMESIG PART, etc. to be laid out before we get to the first note of other voices
}

module.exports = layoutStaffGroup;
