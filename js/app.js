
/**
 * Configure une nouvelle TodoList. (Instancie les autres classes)
 * @param {string} name Nom de la nouvelle TodoList
 * @constructor Todo
 */
function Todo(name) {
	this.storage = new app.Store(name);
	this.model = new app.Model(this.storage);
	this.template = new app.Template();
	this.view = new app.View(this.template);
	this.controller = new app.Controller(this.model, this.view);
}

var todo = new Todo('todos-vanillajs');

// Modifie l'IHM en appelant le controller, utilise l'URL de la page.
function setView() {
	todo.controller.setView(document.location.hash);
}
$on(window, 'load', setView);
$on(window, 'hashchange', setView);