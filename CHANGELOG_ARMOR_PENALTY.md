# Changelog - Implémentation du Malus d'Armure sur le Mouvement

## Version 1.3.0 - Ajout du Malus d'Armure

### 🆕 Nouvelles Fonctionnalités

#### Malus d'Armure sur le Mouvement
- **Formule mise à jour** : Le mouvement prend maintenant en compte le type d'armure portée
- **Nouvelle formule** : `Mouvement = (Degré d'Agilité × 1.5) + 1.5 - Malus d'Armure`
- **Types d'armure supportés** :
  - **Tissu** : Malus = 0m (aucun impact)
  - **Légère** : Malus = 1.5m (réduction modérée)
  - **Lourde** : Malus = 3.0m (réduction importante)
  - **Blindée** : Malus = 4.5m (réduction majeure)

### 🔧 Modifications Techniques

#### Helper Handlebars `getMovementAvailable`
- **Fichier** : `scripts/heros-sheet.js`
- **Changements** :
  - Ajout du paramètre `actor` pour accéder aux informations d'armure
  - Implémentation de la logique de calcul du malus d'armure
  - Protection contre les valeurs négatives avec `Math.max(0, movement)`
  - Gestion des cas où l'acteur ou l'armure n'est pas définie

#### Templates HTML
- **Fichier** : `templates/sheets/heros-sheet.html`
  - Mise à jour de l'appel au helper : `{{getMovementAvailable system.agilite.value actor}}`
  - Mise à jour de la formule affichée : `Formule: Degré d'agilité × 1.5 + 1.5 - Malus d'armure`

- **Fichier** : `templates/sheets/npc-sheet.html`
  - Mise à jour de l'appel au helper : `{{getMovementAvailable actor.system.agilite.value actor}}`
  - Mise à jour de la formule affichée : `Formule: Degré d'agilité × 1.5 + 1.5 - Malus d'armure`

### 📚 Documentation

#### Fichier de Test Principal
- **Fichier** : `mouvement-implementation.html`
- **Ajouts** :
  - Section dédiée aux malus d'armure avec table explicative
  - Mise à jour de la formule affichée
  - Mise à jour de la documentation technique
  - Nouveaux styles CSS pour la section des malus d'armure

#### Nouveau Fichier de Test
- **Fichier** : `test-armor-penalty.html`
- **Fonctionnalités** :
  - Interface interactive pour tester différentes combinaisons
  - Calcul en temps réel du mouvement avec malus d'armure
  - Affichage détaillé des calculs et formules
  - Table de résumé des malus par type d'armure

### 🎨 Styles CSS

#### Nouveaux Styles
- **Section des malus d'armure** : Design cohérent avec le thème existant
- **Table des malus** : Styles spécifiques avec couleurs d'avertissement
- **Responsive design** : Adaptation aux différentes tailles d'écran

### 🔍 Exemples de Calculs

#### Personnage avec 3 degrés d'agilité (4d4 - Bien)
- **Mouvement de base** : 3 × 1.5 + 1.5 = 6.0m
- **Avec armure légère** : 6.0 - 1.5 = 4.5m
- **Avec armure lourde** : 6.0 - 3.0 = 3.0m
- **Avec armure blindée** : 6.0 - 4.5 = 1.5m

#### Personnage avec 5 degrés d'agilité (6d4 - Très rapide)
- **Mouvement de base** : 5 × 1.5 + 1.5 = 9.0m
- **Avec armure légère** : 9.0 - 1.5 = 7.5m
- **Avec armure lourde** : 9.0 - 3.0 = 6.0m
- **Avec armure blindée** : 9.0 - 4.5 = 4.5m

### ✅ Tests et Validation

#### Fonctionnalités Testées
- [x] Calcul correct du mouvement de base
- [x] Application correcte des malus d'armure
- [x] Protection contre les valeurs négatives
- [x] Mise à jour en temps réel des affichages
- [x] Cohérence entre les fiches de héros et de NPCs
- [x] Gestion des cas d'erreur (acteur non défini)

#### Compatibilité
- [x] Foundry VTT v11+
- [x] Handlebars.js
- [x] Navigateurs modernes
- [x] Responsive design

### 🚀 Utilisation

#### Pour les Joueurs
1. Le mouvement se calcule automatiquement selon l'agilité et l'armure
2. Changer le type d'armure met à jour instantanément le mouvement
3. La formule est visible pour la transparence

#### Pour les MJs
1. Créer des NPCs avec différents types d'armure
2. Le mouvement se calcule automatiquement
3. Interface intuitive pour la gestion des caractéristiques

### 🔮 Évolutions Futures Possibles

#### Améliorations Suggérées
- **Armures personnalisées** : Permettre des malus personnalisés
- **Modificateurs temporaires** : Malus/bonus temporaires (magie, conditions)
- **Historique des changements** : Traçabilité des modifications de mouvement
- **Export/Import** : Sauvegarde des configurations d'armure

#### Intégrations
- **Système de combat** : Prise en compte du mouvement dans les règles de combat
- **Cartes de mouvement** : Affichage visuel des zones de mouvement
- **Calculs avancés** : Intégration avec d'autres systèmes (fatigue, blessures)

---

## Historique des Versions

### Version 1.0.0 - Implémentation Initiale
- Affichage du mouvement basé sur l'agilité
- Formule : `Degré d'Agilité × 1.5 + 3`

### Version 1.1.0 - Mise à Jour de la Formule
- Nouvelle formule : `Degré d'Agilité × 1.5 + 1.5`
- Mise à jour de tous les templates et documentations

### Version 1.3.0 - Ajout du Malus d'Armure ⭐
- **ACTUELLE** : Implémentation complète du système de malus d'armure
- Formule finale : `(Degré d'Agilité × 1.5) + 1.5 - Malus d'Armure`
- Support complet des 4 types d'armure
- Interface de test interactive
- Documentation complète et mise à jour

---

*Dernière mise à jour : Version 1.3.0 - Implémentation du Malus d'Armure*
