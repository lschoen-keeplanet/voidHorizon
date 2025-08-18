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

### 7. Système d'Équipement
- **Main principale** : Configuration complète (nom, type, qualité, bonus, description)
- **Main secondaire** : Configuration complète (nom, type, qualité, bonus, description)
- **Types d'équipement** : 
  - Force (Martialité) : Pour les armes de mêlée
  - Agilité (Acuité) : Pour les armes à distance
  - Bouclier : Ajoute des bonus à l'armure et la constitution
- **Qualités d'équipement** : Basées sur les dés (0 à 1d20)
  - 0 : Équipement brisé (pas de bonus au jet)
  - 1d4 : Équipement commun
  - 1d6 : Équipement de qualité
  - 1d8 : Équipement rare
  - 1d10 : Équipement exceptionnel
  - 1d12 : Équipement légendaire
  - 1d20 : Équipement mythique
- **Champ bonus** : Entier (-5 à +10) additionné au résultat des dés ou aux défenses
- **Formules de dés** :
  - Équipement de force : `Martialité + bonus de l'équipement`
  - Équipement d'agilité : `Acuité + bonus de l'équipement`
  - Bouclier : Pas de dés, bonus défensif uniquement
- **Bonus des boucliers** : S'ajoutent automatiquement à l'armure et la constitution
- **Boutons de lancement** : Chaque équipement d'attaque a son bouton de lancement de dés
- **Template de chat** : `templates/chat/weapon-roll.html` pour afficher les résultats

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

### Test du Système d'Équipement
1. **Aller dans l'onglet "Équipement & Actions"**
2. **Configurer la main principale** :
   - Nom : "Épée longue"
   - Type : "Force (Martialité)"
   - Qualité : "Équipement rare (1d8)"
   - Bonus : 2
   - Description : "Une épée de qualité"
3. **Configurer la main secondaire** :
   - Nom : "Dague"
   - Type : "Agilité (Acuité)"
   - Qualité : "Équipement commun (1d6)"
   - Bonus : 1
   - Description : "Une dague rapide"
4. **Tester les lancers de dés** :
   - Cliquer sur "Lancer les dés" pour la main principale
   - Vérifier que la formule est "1d4+2" (Martialité + bonus)
   - Cliquer sur "Lancer les dés" pour la main secondaire
   - Vérifier que la formule est "1d4+1" (Acuité + bonus)
5. **Tester la qualité 0** :
   - Changer la qualité de la main secondaire en "Équipement brisé (0)"
   - Vérifier que le bouton "Lancer les dés" ne fonctionne plus (message d'info)
   - Vérifier que l'équipement ne peut pas être utilisé pour attaquer
6. **Tester un bouclier** :
   - Changer le type de la main secondaire en "Bouclier"
   - Mettre un bonus de 3
   - Vérifier que +3 s'affiche sous l'armure et la constitution
   - Vérifier que le bouton "Lancer les dés" ne fonctionne plus (message d'info)
6. **Vérifier l'affichage dans le chat** avec le template d'équipement
7. **Tester les différents rangs** : Changer le rang d'un équipement et vérifier l'affichage
8. **Tester les bonus négatifs** : Mettre un bonus négatif et vérifier l'affichage

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
