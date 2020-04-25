/**
 * @global
 * @desc Récupère un élément avec querySelector (Sélécteur CSS)
 * @param {string} selector Sélécteur css
 * @param {string} scope Scope de l'élément
 * @link https://developer.mozilla.org/fr/docs/Web/CSS/:scope
 **/
window.qs = function (selector, scope) {
	return (scope || document).querySelector(selector);
};

/**
 * @global
 * @desc Récupère plusieurs élément avec querySelectorAll (Sélécteur CSS)
 * @param {string} selector Sélécteur css
 * @param {string} scope Scope de l'élément
 */
window.qsa = function (selector, scope) {
	return (scope || document).querySelectorAll(selector);
};

/**
 * @global
 * @desc Ajoute un listener à un élément ciblé
 * @param {Objet} target élément cible
 * @param {string} type Type de l'event
 * @param {string} callback Réponse si il y à un évenement
 */
window.$on = function (target, type, callback, useCapture) {
	target.addEventListener(type, callback, !!useCapture);
};

/**
 * @global
 * @desc Ajoute un listener à tous les éléments qui correspondent au sélécteur
 * @param {Object} target élément cible
 * @param {string} selector Sélecteur css de l'élément cible
 * @param {String} type Type de l'event
 * @param {string} handler fonction de callback
 */
window.$delegate = function (target, selector, type, handler) {
	function dispatchEvent(event) {
		var targetElement = event.target;
		var potentialElements = window.qsa(selector, target);
		var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

		if (hasMatch) {
			handler.call(targetElement, event);
		}
	}

	// https://developer.mozilla.org/en-US/docs/Web/Events/blur
	var useCapture = type === 'blur' || type === 'focus';

	window.$on(target, type, dispatchEvent, useCapture);
};

/**
 * @global 
 * @desc Cherche l'élément parent avec le tagName ($parent(qs('a'), 'div');)
 * @param {Objet} element élément cible
 * @param {string} tagName Tag de l'élément ciblé
 */
window.$parent = function (element, tagName) {
	if (!element.parentNode) {
		return;
	}
	if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
		return element.parentNode;
	}
	return window.$parent(element.parentNode, tagName);
};

// Allow for looping on nodes by chaining:
// qsa('.foo').forEach(function () {})
NodeList.prototype.forEach = Array.prototype.forEach;