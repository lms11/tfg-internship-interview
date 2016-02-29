/*
	Geometry.js - Funções e classes úteis para cálculos geométricos
*/

function Point(x, y) {
	this.x = x;
	this.y = y;
	this.distanceTo = function(a) {
		return Math.sqrt((this.x - a.x) * (this.x - a.x) + (this.y - a.y) * (this.y - a.y));
	};
}