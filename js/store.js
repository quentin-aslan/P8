
/**
 * @constructor
 * @desc Crée un nouvel objet Store côté client et créera un espace vide si il n'éxiste pas
 * @param {string} name Nom de la base de données que nous voulons utiliser
 * @param {function} callback Fonction de callback (Si une base de donneé est utilisé alors nous utiliserons des appels AJAX)
 */
function Store(name, callback) {
	callback = callback || function () { };

	this._dbName = name;

	if (!localStorage[name]) {
		var data = {
			todos: []
		};

		localStorage[name] = JSON.stringify(data);
	}

	callback.call(this, JSON.parse(localStorage[name]));
}

/**
 * Trouve un objet en fonction de la requête
 *
 * @param {object} query Requête
 * @param {function} callback Fonction de callback, appelé lorsque la requête à été traité
 *
 * @example
 * db.find({foo: 'bar', hello: 'world'}, function (data) {
 *	 // data will return any items that have foo: bar and
 *	 // hello: world in their properties
 * });
 */
Store.prototype.find = function (query, callback) {
	if (!callback) {
		return;
	}

	var todos = JSON.parse(localStorage[this._dbName]).todos;

	callback.call(this, todos.filter(function (todo) {
		for (var q in query) {
			if (query[q] !== todo[q]) {
				return false;
			}
		}
		return true;
	}));
};

/**
 * Retourne toutes les données
 * 
 * @param {function} callback Fonction de callback, appelé lorsque la requête à été traité
 */
Store.prototype.findAll = function (callback) {
	callback = callback || function () { };
	callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
};

/**
 * Sauvegarde les données dans la base de données. Si aucun élément éxiste alors il sera créer sinon il sera mise à jour.
 *
 * @param {object} updateData L'objet à sauvegarder dans la base de données
 * @param {function} callback Fonction de callback, appelé lorsque la requête à été traité
 * @param {number} id Si l'élément existe déja, son id pour le mettre à jour.
 */
Store.prototype.save = function (updateData, callback, id) {
	var data = JSON.parse(localStorage[this._dbName]);
	var todos = data.todos;

	callback = callback || function () { };

	// Generate an ID
	var newId = "";
	var charset = "0123456789";

	for (var i = 0; i < 6; i++) {
		newId += charset.charAt(Math.floor(Math.random() * charset.length));
	}

	// If an ID was actually given, find the item and update each property
	if (id) {
		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id === id) {
				for (var key in updateData) {
					todos[i][key] = updateData[key];
				}
				break;
			}
		}

		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, todos);
	} else {

		// Assign an ID
		updateData.id = parseInt(newId);


		todos.push(updateData);
		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, [updateData]);
	}
};

/**
 * Supprime un élément dans la base de données
 *
 * @param {number} id ID de l'élément à supprimer
 * @param {function} callback Fonction de callback, appelé lorsque la requête à été traité
 */
Store.prototype.remove = function (id, callback) {
	var data = JSON.parse(localStorage[this._dbName]);
	var todos = data.todos;
	var todoId;

	for (var i = 0; i < todos.length; i++) {
		if (todos[i].id == id) {
			todoId = todos[i].id;
		}
	}

	for (var i = 0; i < todos.length; i++) {
		if (todos[i].id == todoId) {
			todos.splice(i, 1);
		}
	}

	localStorage[this._dbName] = JSON.stringify(data);
	callback.call(this, todos);
};

/**
 * Supprime toute la base de données
 *
 * @param {function} callback The callback to fire after dropping the data
 */
Store.prototype.drop = function (callback) {
	var data = { todos: [] };
	localStorage[this._dbName] = JSON.stringify(data);
	callback.call(this, data.todos);
};

// Export to window
window.app = window.app || {};
window.app.Store = Store;