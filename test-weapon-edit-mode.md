# Test du Mode d'Édition des Armes - voidHorizon

## Objectif
Vérifier que le mode d'édition des armes fonctionne correctement et permet de modifier tous les champs sans sauvegarde automatique.

## Fonctionnalités à Tester

### 1. Mode Lecture par Défaut
- ✅ La section des armes est en mode lecture par défaut
- ✅ Les champs d'édition sont masqués
- ✅ Les valeurs sont affichées en mode lecture
- ✅ Le bouton "Lancer les dés" est visible

### 2. Basculement en Mode Édition
- ✅ Cliquer sur "Éditer" passe en mode édition
- ✅ Les champs d'édition deviennent visibles
- ✅ Les champs de lecture sont masqués
- ✅ Le bouton "Lancer les dés" est masqué
- ✅ Le bouton devient "Sauvegarder" avec icône de sauvegarde

### 3. Modification des Champs
- ✅ **Nom de l'arme** : Champ texte modifiable
- ✅ **Type** : Menu déroulant modifiable (Force, Agilité, Bouclier)
- ✅ **Qualité** : Menu déroulant modifiable (0 à 1d20)
- ✅ **Bonus** : Champ nombre modifiable (-5 à +10)
- ✅ **Description** : Zone de texte modifiable

### 4. Affichage Local des Modifications
- ✅ Les changements s'affichent immédiatement en mode lecture
- ✅ Pas de sauvegarde automatique
- ✅ Les bonus de bouclier s'appliquent immédiatement à l'affichage

### 5. Sauvegarde des Modifications
- ✅ Cliquer sur "Sauvegarder" sauvegarde tous les changements
- ✅ Notification de succès
- ✅ Retour en mode lecture
- ✅ Les changements sont persistants

### 6. Gestion des Erreurs
- ✅ En cas d'erreur de sauvegarde, restauration des valeurs
- ✅ Notification d'erreur
- ✅ Restauration de l'état précédent

## Comment Tester

### Test 1 : Mode Lecture par Défaut
1. Ouvrir une fiche de personnage
2. Aller dans l'onglet "Équipement & Actions"
3. Vérifier que la section des armes est en mode lecture
4. Vérifier que tous les champs d'édition sont masqués

### Test 2 : Passage en Mode Édition
1. Cliquer sur le bouton "Éditer"
2. Vérifier que les champs d'édition deviennent visibles
3. Vérifier que le bouton devient "Sauvegarder"
4. Vérifier que le bouton "Lancer les dés" est masqué

### Test 3 : Modification des Champs
1. Modifier le nom de l'arme principale
2. Changer le type en "Bouclier"
3. Changer la qualité en "Équipement rare (1d8)"
4. Modifier le bonus à +3
5. Ajouter une description
6. Vérifier que les changements s'affichent en mode lecture

### Test 4 : Test des Bonus de Bouclier
1. Avec le type "Bouclier" et bonus +3
2. Vérifier que +3 s'affiche sous l'armure et la constitution
3. Changer le bonus à +5
4. Vérifier que l'affichage se met à jour

### Test 5 : Sauvegarde
1. Cliquer sur "Sauvegarder"
2. Vérifier la notification de succès
3. Vérifier le retour en mode lecture
4. Recharger la fiche et vérifier la persistance

### Test 6 : Test d'Erreur
1. Simuler une erreur (déconnecter la base de données)
2. Tenter de sauvegarder
3. Vérifier la notification d'erreur
4. Vérifier la restauration des valeurs

## Résultats Attendus

- **Mode édition fonctionnel** : Tous les champs sont modifiables
- **Pas de sauvegarde automatique** : Les changements sont stockés en mémoire
- **Affichage local** : Les modifications sont visibles immédiatement
- **Sauvegarde manuelle** : Tous les changements sont sauvegardés en une fois
- **Gestion d'erreurs** : Restauration automatique en cas de problème
- **Bonus de bouclier** : Application immédiate des bonus défensifs

## Fichiers Modifiés

- `templates/sheets/heros-sheet.html` - Ajout de la classe `read-only` par défaut
- `scripts/heros-sheet.js` - Implémentation du système de sauvegarde des armes
- `styles/heros-sheet.css` - Styles pour le mode édition/lecture des armes

## Notes Techniques

- Utilisation de `_pendingWeaponChanges` pour stocker les modifications
- Méthode `_updateLocalWeaponDisplay` pour l'affichage local
- Méthode `_saveAllWeaponChanges` pour la sauvegarde
- Gestion des erreurs avec `_restorePreviousWeaponValues`
- Application immédiate des bonus de bouclier pour l'affichage
