var exitFlag = false;
var lastUpdate = null;
var c, ctx;
var backgrounds = [null, null, null];

// Article: http://www.wired.com/gamelife/2012/03/rj-mical-gdc-speech


var world = {
	xOffset: 0,
	yOffset: 0,
	speed: 10,
	update: function() {
		if(input.up) {
			this.yOffset += this.speed;
		}
		if(input.down) {
			this.yOffset -= this.speed;
		}
		if(input.left) {
			this.xOffset -= this.speed;
		}
		if(input.right) {
			this.xOffset += this.speed;
		}
	},
	debugOutput: function() {
		var debugOutput = $('#gameDebug').html() + '<br />World Debug:';
		debugOutput += '<table><tr><td>up</td><td>(' + this.xOffset + ', ' + this.yOffset + ')</td></tr></table>';
		$('#gameDebug').html(debugOutput);
	}
}

function background() {
	this.image = null;
	this.scale = 1;
	this.scroll = {
		x: 0, y: 0
	};
	this.scrollFactor = {
		x: 1, y: 1
	};
	this.gameWidth = function() {
		if(this.image === null) {
			return 0;
		}
		return (this.image.width * this.scale);
	};
	this.gameHeight = function() {
		if(this.image === null) {
			return 0;
		}
		return (this.image.height * this.scale);
	};
	this.update = function(ms) {
		
	};
	this.draw = function(gameWorld, clearScreen) {
		if(clearScreen) {
			ctx.clearRect(0, 0, c.width, c.height);
		}
		if(this.image !== null) {
			var xPoint = 0 - ((gameWorld.xOffset * this.scrollFactor.x) % this.gameWidth()) - this.gameWidth(); // replace by scroll and scrollFactor
			var yPoint = 0 - ((gameWorld.yOffset * this.scrollFactor.y) % this.gameHeight()) - this.gameHeight();
			
			while(xPoint < c.width) {
				while(yPoint < c.height) {
					//TODO: if image is too big, only draw to edge of canvas
					ctx.drawImage(this.image, xPoint, yPoint, this.gameWidth(), this.gameHeight());
					yPoint += this.gameHeight();
				}
				yPoint = 0 - ((gameWorld.yOffset * this.scrollFactor.y) % this.gameHeight()) - this.gameHeight();
				xPoint += this.gameWidth();
			}
			//console.log('finished drawing bg1');
		}
	}
}

function gameLoop() {
	var newUpdate = new Date();
					
	$('#gameDebug').html(clickDebug);		
	input.debugOutput();
	world.debugOutput();
	if(!exitFlag) {
		drawDebugGrid(); // 'crosshair' or 'grid'
		if(!lastUpdate) {
			lastUpdate = newUpdate;
		}
		for(var i = 0; i < backgrounds.length; i++) {
			if(backgrounds[i] !== null) {
				if(i === 0) {
					// clear bg on first one
					backgrounds[i].draw(world, true);
				} else {
					backgrounds[i].draw(world, false);
				}
			}
		}

		world.update();
	} else {
	}
	lastUpdate = newUpdate;				 	
}

$(function() {
	// on ready
	setupCanvas();
	loadImages(); //TODO: async, need to wait for finish before moving on.
	
	// add listeners for keyboard input
	window.addEventListener('keydown', handleKeyDown, true);
	window.addEventListener('keyup', handleKeyUp, true);

	// initizlise background objects
	backgrounds[0] = new background();
	backgrounds[0].scrollFactor.x = 0.25;
	backgrounds[0].scrollFactor.y = 0.25;
	backgrounds[0].scale = 2;

	backgrounds[1] = new background();
	backgrounds[1].scrollFactor.x = 0.5;
	backgrounds[1].scrollFactor.y = 0.5;
	backgrounds[1].scale = 0.8;

	backgrounds[2] = new background();
	backgrounds[2].scrollFactor.x = 1.5;
	backgrounds[2].scrollFactor.y = 1.5;
	
	// debug
	$("#gameCanvas").click(function(e){
		var gc = $("#gameCanvas");
	    var x = e.pageX - gc.offset().left;
	    var y = e.pageY - gc.offset().top;
	    
		clickDebug =  'Click Debug:';
		clickDebug += '<table><tr><td>click</td><td>(' + e.pageX + ', ' + e.pageY + ')</td></tr>';
		clickDebug += '<tr><td>canvas</td><td>(' + Math.round(x) + ', ' + Math.round(y) + ')</td></tr>';
		clickDebug += '<tr><td>game</td><td>(' + Math.round(x) + ', ' + (c.height - Math.round(y)) + ')</td></tr></table>';
	});

	(function animloop(){
      requestAnimFrame(animloop);
      gameLoop();
    })();
});

function loadImages() {
	// preload images	
	var imageManager = new ImageLoader();
	
	imageManager.queueDownload('images/spacebg64x64.png');
	imageManager.queueDownload('images/bgcloud.png');
	imageManager.queueDownload('images/bgstars.png');
	
	imageManager.downloadAll(function() {
		backgrounds[0].image = imageManager.getAsset('images/spacebg64x64.png');
		backgrounds[1].image = imageManager.getAsset('images/bgcloud.png');
		backgrounds[2].image = imageManager.getAsset('images/bgstars.png');
		
	});
}

function handleKeyDown(evt) {
	//console.log(evt.keyCode);
	switch(evt.keyCode) {
		case inputKeys.quit: // ESC Key
			input.quit = true;
			exitFlag = true;
			//console.log('Exiting Game');
			break;
			
		case inputKeys.left: // Left Key
			if(!input.left) {
				//console.log('left pressed');
				input.left = true;
			}
			break;
		
		case inputKeys.right: // Right Key
			if(!input.right) {
				//console.log('right pressed');
				input.right = true;
			}
			break;
		
		case inputKeys.up: // Up Key
			if(!input.up) {
				input.up = true;
			}
			break;
		
		case inputKeys.down: // Down Key
			if(!input.down) {
				input.down = true;
			}
			break;
		
		defult:
			console.log('unknown key pressed: ' + evt.keyCode)
	}
}

function handleKeyUp(evt) {
	//console.log(evt.keyCode);
	switch(evt.keyCode) {
			
		case inputKeys.left: // Left Key
			input.left = false;
			break;
		
		case inputKeys.right: // Right Key
			input.right = false;
			break;
		
		case inputKeys.up: // Up Key
			input.up = false;
			break;
		
		case inputKeys.down: // Down Key
			input.down = false;
			break;
		
		defult:
			console.log('unknown key released: ' + evt.keyCode)
	}
}

function drawDebugGrid(method) {
	switch(method) {
		case 'grid':
			ctx.strokeStyle = '#ff0000';
			for(var x = 0; x < c.width; x+=level.scale) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, c.height);
				ctx.stroke();
			}
			for(var y = 0; y < c.height; y += level.scale) {
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(c.width, y);
				ctx.stroke();
			}
			break;
			
		case 'crosshair':
			ctx.strokeStyle = '#ff0000';
			ctx.beginPath();
			ctx.moveTo(0, c.height / 2);
			ctx.lineTo(c.width, c.height / 2);
			ctx.stroke();
				
			ctx.beginPath();
			ctx.moveTo(c.width / 2, 0);
			ctx.lineTo(c.width / 2, c.height);
			ctx.stroke();
			break;				
	}
}

function setupCanvas() {
	// define graphics contexts
	c = document.getElementById("gameCanvas");
	ctx = c.getContext("2d");

	// canvas defaults
	ctx.lineWidth = 1;

	// set more after loading bg image
	// flip image and translate down to fix coordinates
	ctx.scale(1, -1); // flip over x axis
	ctx.translate(0, -c.height); // move (0,0) to bottom left to match cartisian plane 
	ctx.translate(0.5, 0.5); // offset for aliasing

}

var clickDebug =  'Click Debug:';
clickDebug += '<table><tr><td>click</td><td>(0,0)</td></tr>';
clickDebug += '<tr><td>canvas</td><td>(0,0)</td></tr>';
clickDebug += '<tr><td>game</td><td>(0,0)</td></tr></table>';

var inputKeys = { // defines key codes used for input
	up: 87, // W
	right: 68, // D
	left: 65, // A
	down: 83, // S
	quit: 27 // ESC
}

// input state object
var input = {
	left: false,
	up: false,
	down: false,
	right: false,
	quit: false,
	debugOutput: function() {
		var debugOutput = $('#gameDebug').html() + '<br />Input Debug:';
		debugOutput += '<table><tr><td>up</td><td>(' + this.up + ')</td></tr>';
		debugOutput += '<table><tr><td>down</td><td>(' + this.down + ')</td></tr>';
		debugOutput += '<tr><td>left</td><td>(' + this.left + ')</td></tr>';
		debugOutput += '<tr><td>right</td><td>(' + this.right + ')</td></tr>';
		debugOutput += '<tr><td>quit</td><td>(' + this.quit + ')</td></tr></table>';
		$('#gameDebug').html(debugOutput);
	}	
}

//BEGIN RAF SHIM
// reference: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
	return	window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(callback){
				window.setTimeout(callback, 1000 / 60);
			};
})();
// END RAF SHIM

// BEGIN ImageLoader Scripts
// ImageLoader based on http://www.html5rocks.com/en/tutorials/games/assetmanager/
function ImageLoader() {
	this.successCount = 0;
	this.errorCount = 0;
	this.downloadQueue = [];
	this.cache = {};
}

ImageLoader.prototype.queueDownload = function(path) {
	this.downloadQueue.push(path);
}

ImageLoader.prototype.downloadAll = function(downloadCallback) {
	if(this.downloadQueue.length === 0) {
		downloadCallback();
	} else {
		for(var i = 0; i < this.downloadQueue.length; i++) {
			var path = this.downloadQueue[i];
			var img = new Image();
			var that = this;
			img.addEventListener("load", function() {
				that.successCount += 1;
				if(that.isDone()) {
					downloadCallback();
				}
			}, false);
			img.addEventListener("error", function() {
				that.errorCount += 1;
				if(that.isDone()) {
					downloadCallback();
				}
			}, false);
			img.src = path;
			this.cache[path] = img;
		}
	}
}

ImageLoader.prototype.isDone = function() {
	return(this.downloadQueue.length === (this.successCount + this.errorCount));
}

ImageLoader.prototype.getAsset = function(path) {
	return this.cache[path];
}
// END ImageLoader Scripts