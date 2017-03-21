/**
 * Object that make the Bliffoscope analysis
 *
 * Its necessary pass as parameters a imageTest and at least one target image
 *
 * Example of use:
 *
 * 		var myAnalysis = new BliffoscopeAnalysis();
 * 		myAnalysis.setTestImage(BliffoscopeFactory.image(testImage));
 * 		myAnalysis.addTarget(BliffoscopeFactory.target(slimeTorpedo, 'Slime Torpedo'));
 * 		myAnalysis.findTargets();
 *
 */
var BliffoscopeAnalysis = function() {

	var
		threshold = .65, //below 0.65 results will provide inappropriate results
		testImage,
		targets = [],
		targetsFound = [],
		executionTime = 0;

	/**
	* Add new target to anaylise. The parameter passed should be a bliffoscopeTarget object
	*
	* @param bliffoscopeTarget
	*
	*/
	this.addTarget = function(bliffoscopeTarget) {
		targets.push(bliffoscopeTarget);
	}

	/**
	* Return a BliffoscopeImage object. The object that is used to search targets on it
	*
	* @return bliffoscopeImage
	*/
	this.getTestImage = function() {
		return testImage;
	}

	/**
	* Set a new image to be tested
	*
	* @param bliffoscopeImage
	*
	*/
	this.setTestImage = function(bliffoscopeImage) {
		testImage = bliffoscopeImage;
	}

	/**
	* Magic method to find all targets defined in a testImage
	*
	*/
	this.findTargets = function() {
		var
			testImageSize = testImage.getSize(),
			targetImage,
			matchRatio;

		var startTime = new Date().getTime();

		// find the targets in all positions of the testImage
		for (var y = 0; y <= testImageSize[1]; y++) {
			for (var x = 0; x <= testImageSize[0]; x++) {

				// search each target in this position
				for(var i=0, len = targets.length; i < len; i++) {
					targetImage = targets[i].getImage();
					targetImage.transposeTo(x, y);
					matchRatio = testImage.getMatchRatio(targetImage);
					if(matchRatio >= threshold)
						targetsFound.push(new BliffoscopeTargetFound(targets[i], [x, y], matchRatio));
				}
			}
		}

		executionTime = new Date().getTime() - startTime;
	}

	/**
	* This return the processing time that analysis tooked to be proceded
	*
	* return integer
	*/
	this.getExecutionTime = function() {
		return executionTime;
	}

	/**
	* Return a array with BliffoscopeTargetFound objects. All the targets that was found in analysis in the returned array
	*
	* return Array[BliffoscopeTargetFound]
	*/
	this.getTargetsFound = function() {
		return targetsFound;
	}

}


/**
 * Target object. Its used on BliffoscopeAnalysis to be analysed
 *
 * Example of use:
 *   new BliffoscopeTarget(imageData, name);
 *
 */
var BliffoscopeTarget = function (imageData, n) {

	var image, name;

	/**
	* @param _imageData String with the image data
	* @param _name Name of the targe
	*
	*/
	var __constructor = function(_imageData, _name) {
		image = new BliffoscopeImage(_imageData);
		name = _name;
	}

	/**
	* Return the BliffoscopeImage object
	*
	* @return BliffoscopeImage
	*/
	this.getImage = function() {
		return image;
	}

	/**
	* Return the name of the target
	*
	* @return string
	*/
	this.getName = function() {
		return name;
	}

	__constructor(imageData, n);
}

/**
 * Target found object. Its used on BliffoscopeAnalysis to be analysed, The results of the analysis return a array of this object
 *
 */
var BliffoscopeTargetFound = function(_target, _coordinates, _matchRatio) {
	var
		target = _target,
		coordinates = _coordinates,
		matchRatio = _matchRatio,

		// Randon color between 30 and 230 (the color scale is 0 to 255, I do not use 0 because id very dark and not use 255 because is lighter)
		color = [
			Math.floor(Math.random() * 200) + 30,
			Math.floor(Math.random() * 200) + 30,
			Math.floor(Math.random() * 200) + 30
		];

	/**
	* Return a BliffoscopeTarget with the target found
	*
	* @return BliffoscopeTarget
	*/
	this.getTarget = function () {
		return target;
	}

	/**
	* Return a BliffoscopeImage with the exactly position where it was found in the testImage
	*
	* @return BliffoscopeImage
	*/
	this.getTargetImagePositioned = function() {
		var img = target.getImage();
		img.transposeTo(coordinates[0], coordinates[1]);
		return img;
	}

	/**
	* Return a BliffoscopeImage with the exactly position where it was found in the testImage
	*
	* @return float
	*/
	this.getMatchRatio = function() {
		return matchRatio;
	}

	/**
	* Return the coordinates where the target was found
	*
	* @return Array[integer]
	*/
	this.getCoordinates = function() {
		return coordinates;
	}

	/**
	* Return the color schema generated for the target found
	*
	* @return Array[integer]
	*/
	this.getColor = function() {
		return color;
	}

}

/**
 * Image object used in analysis (image could be used in testImage or in the targetImage)
 *
 */
var BliffoscopeImage = function(imageData) {

	var
		index = [],
		imageMap = [],
		lastTransposeX = 0,
		lastTransposeY = 0;

	/**
	* Constructor method
	*
	* @param imageData String with the image data (ON pixels should be defined as "+")
	*/
	var __constructor = function(imageData) {
		setImageData(imageData);
	}

	/**
	* Build the array with index data with the ON pixels on the image
	*
	*/
	var buildIndex = function() {
		index = [];
		for(var i=0; i < imageMap.length; i++)
			index[imageMap[i][0] + '.' + imageMap[i][1]] = true;
	}

	/**
	* Set the image data
	*
	* @param imageData String with the image data (ON pixels should be defined as "+")
	*/
	var setImageData = function(imageData) {
		var
			x = 0,
			y = 0,
			len = imageData.length
			char = ''
		;
		for (var i = 0; i < len; i++) {
			char = imageData[i];
			if (char == '+')
				imageMap.push([x, y]);
			x++;
			if (char == '\n') {
				x = 0;
				y++;
			}
		}
		buildIndex();
	}

	/**
	* Return array of index where the pixels ON are found (its used in getMatchRatio only for perfomance purposes)
	*
	* @return Array[]
	*/
	this.getIndex = function() {
		return index;
	}

	/**
	* Return array with each pixel ON found in the image
	*
	* @return Array[]
	*/
	this.getImageMap = function() {
		return imageMap;
	}

	/**
	* Return the size of the image
	*
	* @return Array[]
	*/
	this.getSize = function() {
		var width = imageMap.sort(function(a, b) {
			return b[0] - a[0];
		})[0][0];
		var height = imageMap.sort(function(a, b) {
			return b[1] - a[1];
		})[0][1];
		return [width, height];
	}

	/**
	* Move the pixels ON to new coordinates. Its used to compare the ON pixels with another image
	*
	* @param x integer
	* @param y integer
	*
	*/
	this.transposeTo = function(x, y) {
		imageMap = imageMap.map(function(coords){
			coords[0] += x - lastTransposeX;
			coords[1] += y - lastTransposeY;
			return coords;
		});

		// Everytime the image is transposed, i have to return all pixels to their original position before move again
		// So I save the lastTransposePosition to be used when image should be transposed again
		lastTransposeX = x;
		lastTransposeY = y;

		// each transpose needs to build the indexes again
		buildIndex();
	}

	/**
	* Return the accurance compared one image with another
	*
	* @param bliffoscopeImage
	*
	* @return float
	*/
	this.getMatchRatio = function(bliffoscopeImage) {
		var
			comparedIndex = bliffoscopeImage.getIndex(),
			totalPoints = 0,
			matches = 0;

		for(var i in comparedIndex) {
			if(index[i] === true)
				matches++;
			totalPoints++;
		}

		return matches / totalPoints;
	}

	__constructor(imageData);
}

/**
 * Object used to report the analysis
 *
 *	Example of use:
 *
 * 		var myReport = new BliffoscopeReport(myAnalysis);
 *		myReport.reportTestAnalysis();
 *
 */
var BliffoscopeReport = function(bliffoscopeAnalysis, drawObjectName) {
	var	draw, analysis, imageContainer = 'drawElement';


	/**
	 * Object used to report the analysis
	 *
	 *	Example of use:
	 *
	 * 		var myReport = new BliffoscopeReport(myAnalysis);
	 *		myReport.reportTestAnalysis();
	 *
	 * @param bliffoscopeAnalysis bliffoscopeAnalysis
	 * @param drawObjectName String
	 *
	 */
	var __constructor = function(bliffoscopeAnalysis, drawObjectName) {
		analysis = bliffoscopeAnalysis;
		var size = analysis.getTestImage().getSize();
		clearContainer();
		draw = BliffoscopeFactory.drawObject(drawObjectName, size[0], size[1], imageContainer);
	}

	/**
	 * Write a text in a identified ID on the DOM document
	 *
	 * @param elementId String
	 * @param text String
	 */
	var writeText = function(elementId, text) {
		document.getElementById(elementId).innerHTML = text;
	}

	/**
	 * Write a list of target found in a <ul id="targetsFoundList"> DOM element
	 *
	 * @param targetsFound Array[BliffoscopeTargetFound]
	 */
	var writeTargetFoundList = function(targetsFound) {
		var list = document.getElementById('targetsFoundList');
		list.innerHTML = '';
		for(var i=0; i < targetsFound.length; i++) {
			var t = targetsFound[i].getTarget();
			var color = targetsFound[i].getColor();
			var coordinates = targetsFound[i].getCoordinates();
			var matchRatio = parseFloat(targetsFound[i].getMatchRatio() * 100).toFixed(2) + '%';

			var li = document.createElement('li');
			li.appendChild(document.createTextNode(t.getName() + ' @ ' + coordinates[0] + '.' + coordinates[1] + ' - ' + matchRatio + ' ACC'));
			li.style = 'background-color:rgb(' + color[0] + ',' + color[1] + ',' + color[2];
			list.appendChild(li);
		}
	}

	/**
	 * Draw found target on the screen
	 *
	 * @param targetFound BliffoscopeTargetFound
	 */
	var drawTargetFound = function(targetFound) {
		var color = targetFound.getColor();
		drawImage(targetFound.getTargetImagePositioned(), 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ', .5)');
	}

	/**
	 * Draw a image on the screen
	 *
	 * @param image BliffoscopeImage
	 * @param style String CSS style of the pixels of the image
	 */
	var drawImage = function(image, style) {
		var	map = image.getImageMap();
		for (var i = 0, len = map.length; i < len; i++)
			draw.drawPixel(map[i][0], map[i][1], style);
	}

	/**
	 * Clear the image container (used to draw a new image from a blank area)
	 *
	 */
	var clearContainer = function() {
		var node = document.getElementById(imageContainer);
		while (node.firstChild)
			node.removeChild(node.firstChild);
	}

	/**
	 * Write the report of any analysis on the screen
	 *
	 */
	this.reportTestAnalysis = function() {
		var targets = bliffoscopeAnalysis.getTargetsFound();

		writeText('targetsFound', targets.length);
		writeText('executionTime', bliffoscopeAnalysis.getExecutionTime() / 1000);
		writeTargetFoundList(targets);

		if(draw) {
			drawImage(bliffoscopeAnalysis.getTestImage());
			for(var i=0; i < targets.length; i++)
				drawTargetFound(targets[i]);
		}
	}

	__constructor(bliffoscopeAnalysis, drawObjectName);
}


/**
 * Object used to draw a pixel using HTML <div> element
 *
 */
var divDraw = function(x, y, imageContainer) {
	var imageElement;

	/**
	* Constructor method
	*
	* @param x integer width of drawing area
	* @param y integer height of drawing area
	* @param imageContainer String
	*/
	var __constructor = function(x, y, imageContainer) {
		imageElement = document.createElement('div');
		imageElement.setAttribute('id', 'BliffoscopeDIVImage');
		document.getElementById(imageContainer).appendChild(imageElement);
		drawBoard(x, y);
	}

	/**
	* Build a board with size x,y - In other words, create the divs (pixels) to be painted
	*
	* @param x integer width of drawing area
	* @param y integer height of drawing area
	*/
	var drawBoard = function(x, y) {
		var el;
		for(var i=0; i<x; i++) {
			for(var j=0; j<y; j++) {
				var clear = (j == 0) ? ' clear ' : '';
				el = document.createElement('div');
				el.setAttribute('class', 'imgPixel' + clear);
				el.setAttribute('id', 'p_' + j +'.' + i);
				imageElement.appendChild(el);
			}
		}
	}

	/**
	* Return if the pixel is colored - Its used when i need to repaint a pixel overwriting a color
	*
	* @param x integer width of drawing area
	* @param y integer height of drawing area
	*
	* @return boolean
	*/
	var isPixelColored = function(x, y) {
		var el = document.getElementById('p_' + x + '.' + y);
		if(el == null || el.style.backgroundColor.length == 0) return false;
		return true;
	}

	/**
	* Paint a pixel in the coordinate x, y with the style provided
	*
	* @param x integer width of drawing area
	* @param y integer height of drawing area
	* @param style String
	*/
	this.drawPixel = function(x, y, style) {
		if(style == undefined)
			style = 'gray';
		var el = document.getElementById('p_' + x + '.' + y);
		if(el == null) return;

 		// if the pixel is colored, i do not use 1 alpha transparency instead .5 level, so the color is darker
		if(isPixelColored(x, y))
			style = style.replace('.5', '1');

		// To paint the pixel, I just set the background color of it
		el.setAttribute('style', 'background-color: ' + style);
	}

	__constructor(x, y, imageContainer);
}

/**
 * Object used to draw a pixel using Canvas <canvas> element
 *
 */
var canvasDraw = function(x, y, imageContainer) {
	var imageElement;

	/**
	* Constructor method
	*
	* @param x integer width of drawing area
	* @param y integer height of drawing area
	* @param imageContainer String
	*/
	var __constructor = function(x, y, imageContainer) {
		el = document.createElement('canvas');
		el.setAttribute('id', 'BliffoscopeCanvasImage');
		el.setAttribute('width', x * 5);
		el.setAttribute('height', y * 5);
		document.getElementById(imageContainer).appendChild(el);
		imageElement = el.getContext('2d');
	}

	/**
	* Paint a pixel in the coordinate x, y with the style provided
	*
	* @param x integer width of drawing area
	* @param y integer height of drawing area
	* @param style String
	*/
	this.drawPixel = function(x, y, style) {
		if(style == undefined)
			style = 'gray';
		imageElement.fillStyle = style;
		imageElement.fillRect(x * 5, y * 5, 5, 5);
	}

	__constructor(x, y, imageContainer);
}

/**
 * Object used just to be easier to create new objects
 *
 * Also is used by the BliffoscopeReport object when needs to different Objects to draw the images
 *
 */
var BliffoscopeFactory = {

	/**
	 * Shortcut to create a new BliffoscopeTarget based on a image string
	 *
	 * @param imageData String
	 * @param name String
	 */
	target: function(imageData, name) {
		return new BliffoscopeTarget(imageData, name);
	},

	/**
	 * Shortcut to create a new target based on a image string
	 *
	 * @param imageData String
	 */
	image: function(imageData) {
		return new BliffoscopeImage(imageData);
	},

	/**
	 * Return a draw Object based on the objectName
	 *
	 * @param objectName String
	 * @param x integer
	 * @param y integer
	 * @param imageContainer String (ID of html element where the imaged should be added)
	 */
	drawObject: function(objectName, x, y, imageContainer) {
		switch(objectName) {
			case 'divDraw':
				return new divDraw(x, y, imageContainer);
				break;
			case 'canvasDraw':
				return new canvasDraw(x, y, imageContainer);
				break;
			default:
				false;
		}
	}
}

/**
* Init function for the project
*
*/
var BliffoscopeInit = function() {

	// First I define some variables
	var
		slimeTorpedo	= '     +     \n     +     \n    +++    \n  +++++++  \n  ++   ++  \n ++  +  ++ \n ++ +++ ++ \n ++  +  ++ \n  ++   ++  \n  +++++++  \n    +++    ',
		starShip 	 	= '              \n  ++++++++++  \n ++        ++ \n  ++++++++++  \n      ++      \n      ++      \n      ++      \n  ++++++++++  \n ++        ++ \n  ++++++++++  \n              \n',
		testImage 	 	= '              + +    +              ++           +       +++    +     +               +    +    +   \n +  ++     +   + ++++    + +       +         +          +  +   +++     +++ +           + + +      + \n     +            + +   ++      ++  ++    + ++       +     +      +  +   +      ++   ++       +     \n+   ++      +  ++       +          + +       ++        ++  +           +                  +         \n ++++++ + +    +   ++  +  +   +   +  ++      +         +                     +     ++      +     + +\n  + +   +      +               +      ++     +  ++            +   +    + +     +     +   +  + +     \n+++   + ++   +  +            +  +++       + +       ++                     +            +  + +  +   \n  +++++  +      +                            +  + +            +   +  +        +   +             +  \n +   +   +              +    +      +            +  +   +      +    +     +    +   +                \n ++    +              +     +       ++   +          +       +           ++       +          + +     \n  ++++ +        + +  +    ++ +       +                      +                    +     +         + +\n+   ++  +     +      +  +  +  +    + + ++            + +   + + +    +      +   +++   ++   +     +  +\n+  ++  +              +   ++   ++       +      + +++++            +    +    ++    +++  +    +    + +\n +  + +     +  + +   +           ++  ++ +  +                 + ++                           +++  +  \n +        +              +                ++    +    + +     + ++     ++ + +  + +   +            +++\n +    + ++  +   + + +     +  + ++ +   + + +    +     +  + +++  +                       +          + \n         +   ++ + + ++    +   +  ++ ++ +      +     +      ++   +   +     +     ++  +   + +     ++  \n   +  +            + +     ++ +   +  ++++ ++            +  +  +    +     +      +        +  +  +    \n+    +   ++++       + ++ +      ++ +                           + +      +++ +       ++ +            \n +               +     +   + ++ +   ++   +     +            + +  +  ++  +                 +  +      \n +      +              +       + ++ + +  +       + +     +  ++    +          +      + +   +++       \n         +  +    ++ +     +   +++ ++  +++                        +     +      ++     +  +    ++    +\n +   +       + +         ++    + ++  ++      +  +++     ++ +  + +  +      +                 +   +   \n+    +    +         + + ++  + + + + ++  + +           +  + ++     +               +            +    \n+   ++        +  +             ++ ++ +++        +    ++        +  +   +    +         ++  +  +       \n         +  ++ +   ++       +   + +   + ++   ++ +    +     +            +                    +   ++ \n + +    ++ ++   +      +       +            +   +       +++ ++++++    ++             + +  +       + \n    + +  + +         +       ++    +     +     +  +     +       +  +      +  +++    +         ++    \n    +           ++   +  +          ++  +    ++         ++  +  ++++++            + +  +        +    +\n  +  + ++    +     +     + +       +     +           +    +  ++       + +    ++     ++   +          \n +  +     + + ++    +       +    +++     + ++ +     ++++     ++  +   +  +       ++     +           +\n    ++ +     +         +       +  +       +   +  ++   +       +                   +                +\n      +                 +                  +      +      +++++  ++++        + +       +++  +  ++   +\n  +       +++++   +   +    +  +   +    + +   + +        +++    +  +        +    +      + + +    + + \n +    ++       +   + +       ++      +  +   + +        +++++  + +++++++ ++ +     ++     +           \n  ++++        +    +         +  +  +     + +   +++      +        ++ +  ++   + +        + + ++       \n     +  +  +   +         +     +     +      + +             +     + + ++++ +    ++      ++       +  \n +               +       +      +          +                +    +    ++   ++             + + + ++  \n  +     +   + +      +      +          ++           +   ++       ++++             + +       ++      \n      ++    +  +         ++  +  +    +  +                +    + + + +  + +  +    +  +     + +    +  \n +            +   +     ++            + +   +   +       +   +      ++ ++  ++ +        +   ++     +  \n +    +      +  + ++ + +              +   +           +   +    + ++    +          ++   +           +\n + + +  +  ++ +  ++   +     +  + +                    +      +    + ++++++++  +  ++         ++   ++ \n  +   +  +   + +        ++          ++      +      +      ++  +         +      + ++    +  ++  +  +  \n +  +  ++    +      ++   ++  +    +       +       +      ++             +         +    +   +      ++\n                 +  +++    +++          +     ++  +    +        +  +       +                   ++   \n  ++                  +   + +   +++     ++        +    +  +              ++   ++      +             \n  + ++ +       +             + +   ++                        +      ++    +  +   +            + +   \n+       +     + ++        +   +     +      +          +     ++     + +++    +    +        ++       +\n    +    +     + + +       +   +        +         +        +         + +    +         +  +   ++     \n   +    +               ++  + +     +    +++   + +  ++     +    + + ++     +          +     +    ++ \n         +  +      +  + + +      +        +      +  +  +             + + +  +   + ++  +             \n +            +       ++    +  +      ++       +     +     +      +  +        ++ + ++          + + +\n    ++++      +   +  +   +        ++       +              +  + + ++      + +  ++   +  +     +     ++\n+     + +   +     +++   +     +     +    + +                             +    +  +  ++   +   +      \n   +  + ++      + + +      + +        +   +     +     +   +       +   +            +  +             \n +    +         +    +       + + +++            +   +  ++ +  + ++   +   +          +      ++   ++ + \n    ++ ++             +   ++         +   + +       +++ +             +      +  + +  +  +       +    \n +  ++   ++             +        ++         + + +  +   + + +++   +               +    +     +      +\n    +    +       +         +          +        + +   ++   +        ++           +       + ++   +    \n+         + +  ++  ++    +    + ++     +   ++  +     ++  +                     + + + +   +   +      \n+             +         + ++     + +  +  + +         +    +           +      + +     +  + + + +   + \n               +    ++   +++    + +         +  +  +                +    +  +    + ++   +  +   +  +  \n ++    +           ++   +   +            + ++ ++               + +              +     +    +   +    \n  +    + +    +       +    +  + +++       +         +                 ++    +++   +   + ++          \n            + +  +   +  +       +        +       +    +  + ++ ++              + +   +        +      \n+  +         +       +    +   +       +   +          +    ++ +      ++            +           +     \n           +  +++        +     +    + +        +  +             +          + +                +     \n ++++  +  +       +  +++  ++ +     + ++         ++ + +        +  +  +     + +       ++++          + \n    +   ++ +                ++++  +  +  +   ++  + +   +     + +  +          +      +   ++  ++       \n +               +   ++  ++       +         +++++ ++ ++    + ++      ++     +   +      +   +   +    \n +         +  +    +                   +  +      ++     + + +   +  ++              + +    +++ + +   \n              + ++ ++  + +    +                + ++ +                 ++ +++          +     +       \n+                   +   +      ++ +         +    + +        +             +        +   +        +  +\n  +    +          ++         +       +   + +    +++  + ++  + +  ++  +   +          +++ +  +       ++\n     +        +   +     +                  +++     + ++               +     +  +    +     + +       \n  +    +       +     +         +    +   +     +  ++ +++    +   ++            ++  +          ++     +\n   +  +   +   + +   +     +  +   +    +                     +  + +         +++ +   +    +           \n    +   +    + +       +   + +      +    +        +   +++   +  ++        +     + + +  +    ++   ++  \n    +    +    +   +         + +     + +    +++   +  +      +   +       +++    + + +  +         ++   \n    +   +   +         +  +    +    +   +     +            +   + +   +     +     +             +     \n +      + +++   + + ++  + ++  ++         +      + +  + ++  +            +  +     +    ++ +   + + + +\n +  ++       +           +++ + +  +              +            + +                  ++        +   +  \n                      + +  ++ + +        +++    + + +     ++ ++      +   ++ +     +   +       +    +\n     +  +              +  ++  +    +               + + +      +    +   ++ ++      ++     ++   +     \n  +  + + +         +      +++++  ++    +  +       + + +               +      + +            +     + \n    ++  +   +  +          +++ +  ++   +    +    +       +    +    + ++  +  ++    +   +   +     +    \n       +      + +   + ++++ ++       + +  +  +    +    ++     +          + +++  ++               +   \n +       +   +      +  + +++++ + +      +   +   ++  +    +      + +      +++    +             ++    \n+ +       +    +   +       + + +           +      +        +  +++  +         +          +      ++   \n         +            +    ++  ++++ + +           +          + +   +  +   ++       + + +      +     \n             + ++  ++    ++     +     +           ++    +        ++                  ++ +           \n                     + +          +      + +  +      +    +   +   +  +    +     +    +   +  +   + + \n    +     ++   ++   +  +      + +          +     + +    +       +   +   ++ +    +        + +    ++  \n+                 +          ++       +             +     + +      + +       +  +   +  +     +  ++  \n       + +       + +     +  +    +  +  ++      +       ++   +                           ++ +   +    \n             +  + ++      +  +    +      ++ + +                        +    + +    +    ++          \n          +        +   +                    +         +     + +  + +             +   +  +           \n  +     +       + +     ++   +        +++   +    +       +   + + +       +            +     ++   ++ \n        ++  +   +      +  +    +++  +  ++                  ++ + +   +                + +     +  +  +\n'
	;

	// The textarea is overwrited with the testImage data
	document.getElementById('inputImage').value = testImage;

	// Trigger to make the analisys ('Search for targets button!')
	document.getElementById('btnSearch').addEventListener('click', function() {

		testImage = document.getElementById('inputImage').value;
		if(testImage.indexOf('+') < 0)
			return;

		var button = this;
		var buttonOldValue = button.value;
		button.value = 'Searching for targets...';
		button.disabled = true;
		document.getElementById('outputBox').style = 'display: none;';

		// Need to give some miliseconds time to DOM make some changes on the screen before starting processing
		// This is the reason I'm using this block of code inside a window.setTimeout function
		window.setTimeout(function() {

			// Analisys
			var myAnalysis = new BliffoscopeAnalysis();
			myAnalysis.setTestImage(BliffoscopeFactory.image(testImage));
			myAnalysis.addTarget(BliffoscopeFactory.target(slimeTorpedo, 'Slime Torpedo'));
			myAnalysis.addTarget(BliffoscopeFactory.target(starShip, 'Star Ship'));
			myAnalysis.findTargets(); // do all the magics things

			// Reporting
			var myReport = new BliffoscopeReport(myAnalysis, document.getElementById('outputType').value);
			myReport.reportTestAnalysis();

			button.value = buttonOldValue;
			button.disabled = false;

			document.getElementById('outputBox').style = 'display: block;';
		}, 100);

	});

}

window.addEventListener('load', BliffoscopeInit);