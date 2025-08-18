# Test des Boutons de Lancement de Dés - voidHorizon

## Fonctionnalités Ajoutées

### 1. Boutons de Dés
- ✅ Bouton de dés pour **Martialité**
- ✅ Bouton de dés pour **Pimpance** 
- ✅ Bouton de dés pour **Acuité**
- ✅ Bouton de dés pour **Arcane**

### 2. Positionnement
- Les boutons sont positionnés en haut à droite de chaque caractéristique
- Style circulaire avec icône de dé (d20)
- Couleurs cohérentes avec le thème voidHorizon (rouge #800000)

### 3. Fonctionnalité
- Clic sur le bouton lance automatiquement les dés correspondants
- Utilise la formule actuelle de la caractéristique (ex: 1d6, 1d8, etc.)
- Affiche le résultat dans le chat avec un template personnalisé
- Gestion des erreurs et notifications

### 4. Template de Chat
- Template `templates/chat/roll.html` créé
- Affichage élégant des résultats de dés
- Détails de la formule et des valeurs individuelles
- Style cohérent avec l'interface

## Comment Tester

1. **Ouvrir une fiche de personnage** dans Foundry VTT
2. **Cliquer sur un bouton de dés** (icône de dé à côté d'une caractéristique)
3. **Vérifier que les dés se lancent** et que le résultat s'affiche dans le chat
4. **Changer la valeur d'une caractéristique** et relancer les dés pour vérifier la mise à jour

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
