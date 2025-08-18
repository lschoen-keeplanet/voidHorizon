# Test des Boutons de Lancement de Dés - voidHorizon

## Fonctionnalités Ajoutées

### 1. Boutons de Dés
- ✅ Bouton de dés pour **Martialité**
- ✅ Bouton de dés pour **Pimpance** 
- ✅ Bouton de dés pour **Acuité**
- ✅ Bouton de dés pour **Arcane**

### 2. Positionnement
- Les boutons sont positionnés en dessous des contrôles de statistiques
- Style rectangulaire avec icône de dé (d20)
- Couleurs cohérentes avec le thème voidHorizon (rouge #800000)
- Structure verticale : Icône → Nom → Contrôles → Bouton de dés

### 3. Fonctionnalité
- Clic sur le bouton lance automatiquement les dés correspondants
- Utilise la formule actuelle de la caractéristique (ex: 1d6, 1d8, etc.)
- Affiche le résultat dans le chat avec un template personnalisé
- Gestion des erreurs et notifications

### 4. Système de Sauvegarde
- **Mode édition** : Les changements de caractéristiques sont stockés en mémoire
- **Bouton "Sauvegarder"** : Sauvegarde toutes les caractéristiques modifiées en une fois
- **Pas de sauvegarde automatique** : Les changements ne sont sauvegardés que lors du clic sur "Sauvegarder"
- **Gestion des erreurs** : Restauration automatique des valeurs en cas d'échec de sauvegarde

### 5. Labels des Caractéristiques
- **Martialité** : Deux mains gauches (1d4) → Légende (1d20)
- **Pimpance** : Tâche (1d4) → Ramirez (1d20)
- **Acuité** : Aveugle (1d4) → Fulgurant (1d20)
- **Arcane** : Insensible (1d4) → Archimage (1d20)
- **Affichage cohérent** : Les labels s'affichent correctement dans les menus déroulants et en mode lecture

### 6. Template de Chat
- Template `templates/chat/roll.html` créé
- Affichage élégant des résultats de dés
- Détails de la formule et des valeurs individuelles
- Style cohérent avec l'interface

## Comment Tester

### Test des Dés
1. **Ouvrir une fiche de personnage** dans Foundry VTT
2. **Cliquer sur un bouton de dés** (icône de dé à côté d'une caractéristique)
3. **Vérifier que les dés se lancent** et que le résultat s'affiche dans le chat

### Test du Système de Sauvegarde
1. **Cliquer sur "Éditer"** pour passer en mode édition
2. **Modifier plusieurs caractéristiques** via les menus déroulants
3. **Vérifier que les changements s'affichent** mais ne sont pas sauvegardés
4. **Cliquer sur "Sauvegarder"** pour sauvegarder tous les changements
5. **Vérifier que les changements sont persistants** après rechargement

## Structure des Fichiers Modifiés

- `templates/sheets/heros-sheet.html` - Ajout des boutons de dés
- `styles/heros-sheet.css` - Styles des boutons de dés
- `scripts/heros-sheet.js` - Logique de lancement des dés
- `templates/chat/roll.html` - Template d'affichage des résultats

## Notes Techniques

- Les boutons utilisent l'attribut `data-stat` pour identifier la caractéristique
- La méthode `_onRollDice()` gère les clics et lance les dés via l'API Foundry
- Le template de chat utilise Handlebars pour l'affichage dynamique
- Gestion des erreurs avec notifications utilisateur
