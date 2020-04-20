# App
Instancie les classes, créer la todolist et initialise la vue (affiche toutes les taches)

## Model
Un "Modèle" est une tache. Le fichier *model.js* contient son crud.

## View
Gère tous les évenements de l'utilisateurs sur le DOM (modifier les filtre, modifier une todo ...)

## Helper
Fichier contenant des fonctions ***utilitaire*** aux autres classes.

## Controller
>Fais le lien entre **View** et **Model**.

Lorsque l'utilisateur clique sur ***Ajouter une tache***, un evenement va être activé dans view, le controller va par la suite appeler la method ***create*** dans Model

> setView() sert à changer la vue de l'utilisateur (Et donc d'appliquer des filtres)

## Storage
Store.js (storage :p ) est la class qui va permettre de stocker la todolist, pour ce cas la le développeur à choisi d'utiliser le *localstorage*.

Les données sont donc stocké dans le navigateur et fonctionne à peu pret comme les cookies, MAIS certains navigateur bloque le **localstorage** en navigation privé, c'est le cas de *safari*

### Methods

Afin de rechercher les différentes taches, des méthodes sont disponible : 
* find *Rechercher une tache*
* findAll *Rechercher toutes les taches*
* save *Sauvegarder une tache*
* remove *Supprimer une tache*
* drop *Supprimer toutes les taches*

## Template
Template pour afficher une tache à l'utilisateur

# Jasmine

**toHaveBeenCalledWith** 
Vérifie qu'une fonction à bien été appelée avec les parametres données.

Tous les tests s'appuie sur une fonction du controller qui ensuite appel la vue et le model, le test doit s'assurer que les fonctions view & model soient bien appelé avec les bons paramètres.

# Audit de performance
Le site met entre 27 et 33 ms à charger, voici les résultats d'un chargement de la page : 