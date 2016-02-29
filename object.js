/*
	Object.js - Classe do Carro, da Bicicleta e da Ciroc
*/

function Car(x, y, w, h, isPlayer, path, track) {
	// Variables
	this.x = x;
	this.y = y;
	this.width  = w;
	this.height = h;
	this.imagePath = path;
	this.horizontalSpeed = 20;
	this.isPlayer = isPlayer;
	this.track = track === undefined ? -1 : track;

	// Methods
	this.init = function() {
		this.domElement = document.createElement('img');
		this.domElement.src = this.imagePath;
		this.domElement.alt = "Car";
		this.domElement.style.display = 'none';

		document.body.appendChild(this.domElement);
	}

	this.isColliding = function(another) {
		return 	(this.x < another.x + another.width &&
   				this.x + this.width > another.x &&
   				this.y < another.y + another.height &&
   				this.height + this.y > another.y);
	}

	// Initialize
	this.init();
}

function Bike(x, y, track) {
	// Variables
	this.x = x;
	this.y = y;
	this.width  = 32;
	this.height = 80;
	this.imagePath = "assets/bike.png";
	this.verticalSpeed = Game.bikeVerticalSpeed;
	this.track = track === undefined ? 0 : track; // 0 => esquerda (descendo). 1 => direita (subindo)

	// Methods
	this.init = function() {
		this.domElement = document.createElement('img');
		this.domElement.src = this.imagePath;
		this.domElement.alt = "Bike";
		this.domElement.style.display = 'none';

		document.body.appendChild(this.domElement);
	}

	this.isColliding = function(another) {
		return 	(this.x < another.x + another.width &&
   				this.x + this.width > another.x &&
   				this.y < another.y + another.height &&
   				this.height + this.y > another.y);
	}

	// Initialize
	this.init();
}

function Ciroc(x, y) {
	// Variables
	this.x = x;
	this.y = y;
	this.width  = 25;
	this.height = 100;
	this.imagePath = "assets/ciroc.png";

	// Methods
	this.init = function() {
		this.domElement = document.createElement('img');
		this.domElement.src = this.imagePath;
		this.domElement.alt = "Ciroc";
		this.domElement.style.display = 'none';

		document.body.appendChild(this.domElement);
	}

	this.isColliding = function(another) {
		return 	(this.x < another.x + another.width &&
   				this.x + this.width > another.x &&
   				this.y < another.y + another.height &&
   				this.height + this.y > another.y);
	}

	// Initialize
	this.init();
}