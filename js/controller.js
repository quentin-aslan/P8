/**
 * Fais intérargir le model et la vue ensemble.
 *
 * @constructor
 * @param {object} model Instance du model
 * @param {object} view Instance de la vue
 */
function Controller(model, view) {
	var self = this;
	self.model = model;
	self.view = view;

	self.view.bind('newTodo', function (title) {
		self.addItem(title);
	});

	self.view.bind('itemEdit', function (item) {
		self.editItem(item.id);
	});

	self.view.bind('itemEditDone', function (item) {
		self.editItemSave(item.id, item.title);
	});

	self.view.bind('itemEditCancel', function (item) {
		self.editItemCancel(item.id);
	});

	self.view.bind('itemRemove', function (item) {
		self.removeItem(item.id);
	});

	self.view.bind('itemToggle', function (item) {
		self.toggleComplete(item.id, item.completed);
	});

	self.view.bind('removeCompleted', function () {
		self.removeCompletedItems();
	});

	self.view.bind('toggleAll', function (status) {
		self.toggleAll(status.completed);
	});
}

/**
 * @desc Charge et initialise la vue
 *
 * @param {string} locationHash 3 valeurs peut être attribuée : '' | 'active' | 'completed'
 */
Controller.prototype.setView = function (locationHash) {
	var route = locationHash.split('/')[1];
	var page = route || '';
	this._updateFilterState(page);
};

/**
 * @desc Affiche toutes les tâches de la liste
 */
Controller.prototype.showAll = function () {
	var self = this;
	self.model.read(function (data) {
		self.view.render('showEntries', data);
	});
};

/**
 * @desc Affiche les tâches active
 */
Controller.prototype.showActive = function () {
	var self = this;
	self.model.read({ completed: false }, function (data) {
		self.view.render('showEntries', data);
	});
};

/**
 * @desc Affiche les tâches terminées
 */
Controller.prototype.showCompleted = function () {
	var self = this;
	self.model.read({ completed: true }, function (data) {
		self.view.render('showEntries', data);
	});
};

/**
 * @desc Ajoute une tâche (Ajoute dans le DOM et dans la base de données)
 * @param {String} title Titre de la tâche à ajouter
 */
Controller.prototype.addItem = function (title) {
	var self = this;

	if (title.trim() === '') {
		return;
	}

	self.model.create(title, function () {
		self.view.render('clearNewTodo');
		self._filter(true);
	});
};

/**
 * @desc Active l'édition d'une tâche
 * @param {Number} id Id de la tâche à modifier
 */
Controller.prototype.editItem = function (id) {
	var self = this;
	self.model.read(id, function (data) {
		self.view.render('editItem', { id: id, title: data[0].title });
	});
};

/**
 * @desc Enregistre la nouvelle tâche dans la case de données
 * @param {Number} id Id de la tâche à modifier
 * @param {String} title Nouveau titre de la tâche
 */
Controller.prototype.editItemSave = function (id, title) {
	var self = this;

	while (title[0] === " ") {
		title = title.slice(1);
	}

	while (title[title.length - 1] === " ") {
		title = title.slice(0, -1);
	}

	if (title.length !== 0) {
		self.model.update(id, { title: title }, function () {
			self.view.render('editItemDone', { id: id, title: title });
		});
	} else {
		self.removeItem(id);
	}
};

/**
 * @desc Annule l'édition d'une tâche 
 * @param {Number} id Id de la tâche
 **/
Controller.prototype.editItemCancel = function (id) {
	var self = this;
	self.model.read(id, function (data) {
		self.view.render('editItemDone', { id: id, title: data[0].title });
	});
};

/**
 * @desc Supprime une tâche
 * @param {Number} id Id de la tâche à supprimer
 */
Controller.prototype.removeItem = function (id) {
	var self = this;
	var items;
	self.model.read(function (data) {
		items = data;
	});

	self.model.remove(id, function () {
		self.view.render('removeItem', id);
	});

	self._filter();
};

/**
 * @desc Supprime toutes les tâches terminées
 */
Controller.prototype.removeCompletedItems = function () {
	var self = this;
	self.model.read({ completed: true }, function (data) {
		data.forEach(function (item) {
			self.removeItem(item.id);
		});
	});

	self._filter();
};

/**
 * @desc Actualise la tâche en fonction de son status (Sur le DOM)
 * @param {number} id ID de la tâche
 * @param {object} completed Vérifie si le champ "completed" est vrais ou non
 * @param {boolean|undefined} silent Empêche de filtrer une deuxième fois les éléments de la liste
 */
Controller.prototype.toggleComplete = function (id, completed, silent) {
	var self = this;
	self.model.update(id, { completed: completed }, function () {
		self.view.render('elementComplete', {
			id: id,
			completed: completed
		});
	});

	if (!silent) {
		self._filter();
	}
};

/**
 * @desc Active ou désactive les cases cochées
 * @param {String} completed Les tâches terminées
 */
Controller.prototype.toggleAll = function (completed) {
	var self = this;
	self.model.read({ completed: !completed }, function (data) {
		data.forEach(function (item) {
			self.toggleComplete(item.id, completed, true);
		});
	});

	self._filter();
};

/**
 * @desc Mets à jours le compteur de tâche (Situé en bas à gauche)
 */
Controller.prototype._updateCount = function () {
	var self = this;
	self.model.getCount(function (todos) {
		self.view.render('updateElementCount', todos.active);
		self.view.render('clearCompletedButton', {
			completed: todos.completed,
			visible: todos.completed > 0
		});

		self.view.render('toggleAll', { checked: todos.completed === todos.total });
		self.view.render('contentBlockVisibility', { visible: todos.total > 0 });
	});
};

/**
 * @desc Re-Filtre les tâches en fonction de leur status
 * @param {boolean|undefined} force  Refiltre les tâches
 */
Controller.prototype._filter = function (force) {
	var activeRoute = this._activeRoute.charAt(0).toUpperCase() + this._activeRoute.substr(1);

	this._updateCount();

	if (force || this._lastActiveRoute !== 'All' || this._lastActiveRoute !== activeRoute) {
		this['show' + activeRoute]();
	}

	this._lastActiveRoute = activeRoute;
};

/**
 * @desc Mets à jour l'url pour filtrer les tâches (/active, /completed)
 */
Controller.prototype._updateFilterState = function (currentPage) {
	this._activeRoute = currentPage;

	if (currentPage === '') {
		this._activeRoute = 'All';
	}

	this._filter();

	this.view.render('setFilter', currentPage);
};

// Export to window
window.app = window.app || {};
window.app.Controller = Controller;
