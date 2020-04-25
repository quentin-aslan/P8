var htmlEscapes = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	'\'': '&#x27;',
	'`': '&#x60;'
};

var escapeHtmlChar = function (chr) {
	return htmlEscapes[chr];
};

var reUnescapedHtml = /[&<>"'`]/g;
var reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

var escape = function (string) {
	return (string && reHasUnescapedHtml.test(string))
		? string.replace(reUnescapedHtml, escapeHtmlChar)
		: string;
};

/**
 * Initialise le template utilisé pour afficher les tâches
 *
 * @constructor
 */
function Template() {
	this.defaultTemplate
		= '<li data-id="{{id}}" class="{{completed}}">'
		+ '<div class="view">'
		+ '<input class="toggle" type="checkbox" {{checked}}>'
		+ '<label>{{title}}</label>'
		+ '<button class="destroy"></button>'
		+ '</div>'
		+ '</li>';
}

/**
 * Créer un élément "<li>" et le place dans le template de l'application
 *
 * Pour optimiser l'application il aura été préférable d'utiliser un moteur de template comme Mustache ou Handlebars
 * 
 * @param {object} data Objet contenant les informations à remplacer
 * @returns {string} Template HTML contenant l'élément "<li>"
 *
 * @example
 * view.show({
 *	id: 1,
 *	title: "Hello World",
 *	completed: 0,
 * });
 */
Template.prototype.show = function (data) {
	var i, l;
	var view = '';

	for (i = 0, l = data.length; i < l; i++) {
		var template = this.defaultTemplate;
		var completed = '';
		var checked = '';

		if (data[i].completed) {
			completed = 'completed';
			checked = 'checked';
		}

		template = template.replace('{{id}}', data[i].id);
		template = template.replace('{{title}}', escape(data[i].title));
		template = template.replace('{{completed}}', completed);
		template = template.replace('{{checked}}', checked);

		view = view + template;
	}

	return view;
};

/**
 * @desc Affiche le nombre de tâches actives en bas à gauche
 *
 * @param {number} activeTodos Nombre de tâches actives
 * @returns {string} Chaîne de charactère contenant le nombre de tâches actives
 */
Template.prototype.itemCounter = function (activeTodos) {
	var plural = activeTodos === 1 ? '' : 's';
	return `<strong>${activeTodos}</strong> item ${plural} left`;
	// return '<strong>' + activeTodos + '</strong> item' + plural + ' left';
};

/**
 * @desc Mets à jour le bouton "Clear Completed", il est affiché si il y à des tâches terminées
 *
 * @param {Array} completedTodos Nombre de tâches terminées
 * @returns {string} Chaîne de charactère ("Clear completed" || void)
 */
Template.prototype.clearCompletedButton = function (completedTodos) {
	if (completedTodos > 0) {
		return 'Clear completed';
	} else {
		return '';
	}
};

// Export to window
window.app = window.app || {};
window.app.Template = Template;
