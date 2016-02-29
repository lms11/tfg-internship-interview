/*
	Controller.js — Aqui é onde gerenciamos com as entradas do usuário.
*/

// Constantes: key codes do teclado
var CONST_LEFT_ARROW	= 37,
	CONST_RIGHT_ARROW	= 39;

// Adicionamos listeners para acompanharmos as entradas do usuário
// e salvá-las para uso posterior
window.addEventListener('keyup', function(event) {
	keyUp(event);

}, false);

window.addEventListener('keydown', function(event) {
	keyDown(event);

}, false);

// Nossa variavel de controle
var currentInput = {};

// Funções
function keyUp(event) {
	currentInput[event.keyCode] = false;
}

function keyDown(event) {
	currentInput[event.keyCode] = true;
}

function isKeyPressed(key) {
	if (key in currentInput) return currentInput[key];
	else return false;
}