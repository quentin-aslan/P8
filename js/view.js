/**
 * @desc Gére les intéractions avec le DOM et définit les valeurs par défaut du template.
 *
 * @constructor
 * @param {object} template Le template utilisé
 */
function View(template) {
	this.template = template;

	this.ENTER_KEY = 13;
	this.ESCAPE_KEY = 27;

	this.$todoList = qs('.todo-list');
	this.$todoItemCounter = qs('.todo-count');
	this.$clearCompleted = qs('.clear-completed');
	this.$main = qs('.main');
	this.$footer = qs('.footer');
	this.$toggleAll = qs('.toggle-all');
	this.$newTodo = qs('.new-todo');
}

/**
 * @desc Supprime une tâche
 * @param {Number} id Id de la tache à supprimer
 */
View.prototype._removeItem = function (id) {
	var elem = qs('[data-id="' + id + '"]');

	if (elem) {
		this.$todoList.removeChild(elem);
	}
};

/**
 * @desc Supprime toutes les tâches terminées
 * @param {Number} completedCount Nombre de tâches terminées
 * @param {Boolean} visible Le bouton est'il visible ou non ?
 */
View.prototype._clearCompletedButton = function (completedCount, visible) {
	this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
	this.$clearCompleted.style.display = visible ? 'block' : 'none';
};

/**
 * @desc Modifie le filtre de la page (Affiche toutes les tâche s/ Seulement les terminées / Seulement celle qui ne sont pas terminée)
 * @param {String} currentPage Page courante (active, completed)
 */
View.prototype._setFilter = function (currentPage) {
	qs('.filters .selected').className = '';
	qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
};

/**
 * @desc Vérifie si une tâche est terminée ou non
 * @param {Number} id Id de la tâche
 * @param {Boolean} completed La tâche est terminée ou non ? 
 */
View.prototype._elementComplete = function (id, completed) {
	var listItem = qs('[data-id="' + id + '"]');

	if (!listItem) {
		return;
	}

	listItem.className = completed ? 'completed' : '';

	qs('input', listItem).checked = completed;
};

/**
 * @desc Modifie une tâche
 * @param {Number} id Id de la tâche
 * @param {String} title Titre de la tâche
 */
View.prototype._editItem = function (id, title) {
	var listItem = qs('[data-id="' + id + '"]');

	if (!listItem) {
		return;
	}

	listItem.className = listItem.className + ' editing';

	var input = document.createElement('input');
	input.className = 'edit';

	listItem.appendChild(input);
	input.focus();
	input.value = title;
};

/**
 * @desc Modifie le status d'une tâche en "terminée" (Modification terminé)
 * @param {Number} id Id de la tâche
 * @param {String} title Titre de la tâche
 */
View.prototype._editItemDone = function (id, title) {
	var listItem = qs('[data-id="' + id + '"]');

	if (!listItem) {
		return;
	}

	var input = qs('input.edit', listItem);
	listItem.removeChild(input);

	listItem.className = listItem.className.replace('editing', '');

	qsa('label', listItem).forEach(function (label) {
		label.textContent = title;
	});
};

/**
 * @description Renvoie toutes les tâches dans le DOM
 * @param {String} viewCmd Nom de la commande
 * @param {Object} parameter paramètres actifs
 */
View.prototype.render = function (viewCmd, parameter) {
	var self = this;
	var viewCommands = {
		showEntries: function () {
			self.$todoList.innerHTML = self.template.show(parameter);
		},
		removeItem: function () {
			self._removeItem(parameter);
		},
		updateElementCount: function () {
			self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
		},
		clearCompletedButton: function () {
			self._clearCompletedButton(parameter.completed, parameter.visible);
		},
		contentBlockVisibility: function () {
			self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
		},
		toggleAll: function () {
			self.$toggleAll.checked = parameter.checked;
		},
		setFilter: function () {
			self._setFilter(parameter);
		},
		clearNewTodo: function () {
			self.$newTodo.value = '';
		},
		elementComplete: function () {
			self._elementComplete(parameter.id, parameter.completed);
		},
		editItem: function () {
			self._editItem(parameter.id, parameter.title);
		},
		editItemDone: function () {
			self._editItemDone(parameter.id, parameter.title);
		}
	};

	viewCommands[viewCmd]();
};

/**
 * @desc Récupère l'id d'une tâche
 * @param {Object} element Tâche 
 */
View.prototype._itemId = function (element) {
	var li = $parent(element, 'li');
	return parseInt(li.dataset.id, 10);
};

/**
 * @desc Décrit les actions à réaliser après la modification d'une tâche
 * @param {function} handler Fonction callback
 */
View.prototype._bindItemEditDone = function (handler) {
	var self = this;
	$delegate(self.$todoList, 'li .edit', 'blur', function () {
		if (!this.dataset.iscanceled) {
			handler({
				id: self._itemId(this),
				title: this.value
			});
		}
	});

	$delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
		if (event.keyCode === self.ENTER_KEY) {
			this.blur();
		}
	});
};
/**
 * @desc Décrit les actions à réaliser lorsqu'une modification de tâche est annulé
 * @param {function} handler Fonction callback
 */
View.prototype._bindItemEditCancel = function (handler) {
	var self = this;
	$delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
		if (event.keyCode === self.ESCAPE_KEY) {
			this.dataset.iscanceled = true;
			this.blur();

			handler({ id: self._itemId(this) });
		}
	});
};

/**
 * @desc Listeners sur les tâches, elles sont appelées en fonctions des actions de l'utilisateur
 * @param {string} event L'evenement réalisé
 * @param {function} handler Fonction callback
 */
View.prototype.bind = function (event, handler) {
    var self = this;
    // amélioration
    switch (event) {
        case 'newTodo':
            $on(self.$newTodo, 'change', function() {
                handler(self.$newTodo.value);
            });
            break;
        case 'removeCompleted':
            $on(self.$clearCompleted, 'click', function() {
                handler();
            });
            break;
        case 'toggleAll':
            $on(self.$toggleAll, 'click', function() {
                handler({ completed: this.checked });
            });
            break;
        case 'itemEdit':
            $delegate(self.$todoList, 'li label', 'dblclick', function() {
                handler({ id: self._itemId(this) });
            });
            break;
        case 'itemRemove':
            $delegate(self.$todoList, '.destroy', 'click', function() {
                handler({ id: self._itemId(this) });
            });
            break;
        case 'itemToggle':
            $delegate(self.$todoList, '.toggle', 'click', function() {
                handler({
                    id: self._itemId(this),
                    completed: this.checked,
                });
            });
            break;
        case 'itemEditDone':
            self._bindItemEditDone(handler);
            break;
        case 'itemEditCancel':
            self._bindItemEditCancel(handler);
            break;
    }
};

// Export to window
window.app = window.app || {};
window.app.View = View;