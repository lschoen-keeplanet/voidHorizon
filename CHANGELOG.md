# Changelog - Void Horizon

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-12-19

### 🎉 Version Release - Character Sheet Core

#### ✨ Ajouté
- **Système de caractéristiques complet**
  - Jets de dés Safe/Unsafe avec transformation automatique
  - Calculs de bonus dynamiques et malus d'armure
  - Affichage des ranges avec bonus intégrés
  - Système de réussite/échec critiques pour les jets unsafe

- **Système de traits avancé**
  - Création, édition et suppression de traits
  - Bonus dynamiques sur caractéristiques et actions de protection
  - Gestion des bonus sur Esquive, Blocage et Parade
  - Interface utilisateur intuitive avec formulaires

- **Système de compétences**
  - Création de compétences avec niveaux de maîtrise (Novice, Compagnon, Maître)
  - Jets de compétences avec formules Safe/Unsafe
  - Association automatique aux caractéristiques
  - Gestion des bonus de compétences

- **Système d'armes et d'équipement**
  - Types d'armes : Force, Agilité, Acuité, Bouclier
  - Jets d'attaque avec formules complètes
  - Système de qualité d'arme avec dés
  - Ranges d'attaque visuels avec bonus intégrés
  - Masquage automatique des boutons pour les boucliers

- **Système de protection et résistance**
  - Calcul automatique de la résistance
  - Jets d'Esquive, Blocage et Parade
  - Intégration des bonus de traits
  - Formules dynamiques basées sur l'équipement

- **Interface utilisateur moderne**
  - Design responsive et intuitif
  - Mises à jour en temps réel
  - Gestion des états d'édition/lecture
  - Notifications dans le chat uniquement

#### 🔧 Modifié
- Refactorisation complète du système de bonus
- Intégration des malus d'armure dans l'affichage des caractéristiques
- Optimisation des calculs de dés et de ranges
- Amélioration de la gestion des erreurs

#### 🐛 Corrigé
- Problème de scope des variables dans les helpers Handlebars
- Gestion des compétences supprimées (soft delete)
- Inversion des modes Safe/Unsafe pour les compétences
- Application incorrecte des malus d'agilité sur la martialité
- Affichage des boutons de parade/blocage selon l'équipement

#### 🗑️ Supprimé
- Affichage séparé des bonus totaux
- Messages système pour les jets de dés
- Divs de malus d'armure séparées
- Helpers JavaScript personnalisés (remplacés par Handlebars natif)

---

## [0.0.1] - 2024-12-18

### 🚀 Version Initiale
- Structure de base du système
- Configuration Foundry VTT
- Architecture des fichiers et dossiers

---

## Types de changements

- `✨ Ajouté` pour les nouvelles fonctionnalités
- `🔧 Modifié` pour les changements dans les fonctionnalités existantes
- `🐛 Corrigé` pour les corrections de bugs
- `🗑️ Supprimé` pour les fonctionnalités supprimées
- `🚀 Version Initiale` pour les versions de base
