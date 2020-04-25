/**
 * Instancie un Model, en intéraction avec la class Store, un "Model" correspond à une TODO.
 *
 * @constructor
 * @param {object} storage Instance de la base de données
 */
function Model(storage) {
	this.storage = storage;
}

/**
 * Créer une nouvelle tâche
 *
 * @param {string} [title] Titre de la tâche
 * @param {function} [callback] Fonction de callback appelée une fois la tâche créée
 */
Model.prototype.create = function (title, callback) {
	title = title || '';
	callback = callback || function () { };

	var newItem = {
		title: title.trim(),
		completed: false
	};

	this.storage.save(newItem, callback);
};

/**
 * Recherche et retourne une tâche, si le paramètre "query" est vide alors toutes les taches seront renvoyé.
 * Si une chaîne ou un nombre, il le recherchera.
 * @param {string|number|object} [query] Requête pour filtrer les tâche à recupérer
 * @param {function} [callback] Fonction de callback appelée lorsque la tâche est trouvé
 *
 * @example
 * model.read(1, func); // Will find the model with an ID of 1
 * model.read('1'); // Same as above
 * //Below will find a model with foo equalling bar and hello equalling world.
 * model.read({ foo: 'bar', hello: 'world' });
 */
Model.prototype.read = function (query, callback) {
	var queryType = typeof query;
	callback = callback || function () { };

	if (queryType === 'function') {
		callback = query;
		return this.storage.findAll(callback);
	} else if (queryType === 'string' || queryType === 'number') {
		query = parseInt(query, 10);
		this.storage.find({ id: query }, callback);
	} else {
		this.storage.find(query, callback);
	}
};

/**
 * Mets à jours une tâche
 * @param {number} id Id de la tâche à modifier
 * @param {object} data Les propriétés à modifier et leur nouvelle valeur
 * @param {function} callback Fonction de callback appelée lorsque la tâche à été modifié
 */
Model.prototype.update = function (id, data, callback) {
	this.storage.save(data, callback, id);
};

/**
 * Supprime une tâche
 *
 * @param {number} id Id de la tâche à supprimer
 * @param {function} callback Fonction de callback appelée lorsque la tâche à été supprimé
 */
Model.prototype.remove = function (id, callback) {
	this.storage.remove(id, callback);
};

/**
 * Supprime TOUTES les tâches (ATTENTION NON REVERSIBLE)
 *
 * @param {function} callback Fonction de callback appelée lorsque toutes les tâches seront supprimées
 */
Model.prototype.removeAll = function (callback) {
	this.storage.drop(callback);
};

/**
 * @desc Nombre de tâches
 * @param {function} callback Fonction de callback
 */
Model.prototype.getCount = function (callback) {
	var todos = {
		active: 0,
		completed: 0,
		total: 0
	};

	this.storage.findAll(function (data) {
		data.forEach(function (todo) {
			if (todo.completed) {
				todos.completed++;
			} else {
				todos.active++;
			}

			todos.total++;
		});
		callback(todos);
	});
};

// Export to window
window.app = window.app || {};
window.app.Model = Model;

