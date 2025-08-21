# 🎲 Nouvelles Fonctionnalités - Jets de Dés NPC

## 📋 Résumé des Ajouts

Les NPCs de Void Horizon disposent maintenant d'un système complet de jets de dés avec gestion des bonus et affichage stylisé dans le chat.

## ✨ Fonctionnalités Implémentées

### 1. 🎯 Jets de Caractéristiques
- **Boutons de jet** : Chaque caractéristique a un bouton 🎯 pour lancer les dés
- **Système de bonus** : Champs de saisie verts pour ajouter des bonus/malus
- **Formules intégrées** : Utilise automatiquement la formule de la caractéristique + bonus
- **Gestion des critiques** : Détection automatique des coups critiques et échecs critiques
- **Affichage détaillé** : Résultat, formule, dés individuels et bonus appliqués

### 2. ⚔️ Jets d'Attaques
- **Boutons de jet** : Chaque attaque a un bouton ⚔️ pour lancer les dés
- **Formules personnalisables** : Support des formules complexes (1d20+5, 2d6+3, etc.)
- **Gestion des critiques** : Détection automatique selon le type de dés
- **Descriptions intégrées** : Affichage de la description de l'attaque dans le chat
- **Résultats visuels** : Couleurs et animations selon le résultat

### 3. ⭐ Utilisation des Compétences
- **Boutons d'utilisation** : Chaque compétence a un bouton ⭐
- **Pas de jet de dés** : Affichage direct de la description dans le chat
- **Organisation améliorée** : Titre de la compétence au-dessus du nom du NPC
- **Style distinctif** : Interface différente des jets de dés

### 4. 🎨 Interface de Chat Stylisée
- **Messages distinctifs** : Chaque type de jet a son propre style
- **Animations** : Effets visuels pour les coups critiques et échecs critiques
- **Contraste optimisé** : Fond gris clair (#f8f9fa) avec texte noir (#212529)
- **Informations complètes** : Formules, résultats, bonus et descriptions
- **Apparence professionnelle** : Style sobre et élégant sans emojis

## 🔧 Implémentation Technique

### Fichiers Modifiés
- **`templates/sheets/npc-sheet.html`** : Ajout des boutons de jet et champs de bonus
- **`scripts/npc-sheet.js`** : Nouvelles méthodes pour gérer les jets de dés
- **`styles/npc-sheet.css`** : Styles pour les boutons et messages de chat
- **`template.json`** : Ajout des champs bonus par défaut

### Nouvelles Méthodes JavaScript
- `_onRollCharacteristic()` : Gestion des jets de caractéristiques
- `_onRollAttack()` : Gestion des jets d'attaques
- `_onRollSkill()` : Gestion de l'utilisation des compétences
- `_onBonusChange()` : Gestion des changements de bonus
- `_renderCharacteristicRoll()` : Rendu des jets de caractéristiques
- `_renderAttackRoll()` : Rendu des jets d'attaques
- `_renderSkillUse()` : Rendu de l'utilisation des compétences

### Styles CSS Ajoutés
- **Boutons de jet** : Styles distincts pour chaque type (caractéristiques, attaques, compétences)
- **Champs de bonus** : Style vert distinctif pour les bonus
- **Messages de chat** : Styles spécifiques pour chaque type de jet
- **Animations** : Effets de pulsation et de secousse pour les critiques
- **Palette de couleurs** : Fond gris clair avec texte noir pour un contraste optimal

## 🧪 Test des Fonctionnalités

### Fichier de Test
- **`test-npc-rolls.html`** : Démonstration interactive des nouvelles fonctionnalités
- **`test-npc-chat-styles.html`** : Démonstration des nouveaux styles de chat
- **Simulation des jets** : Tests des formules et des bonus
- **Interface de démonstration** : NPC exemple avec toutes les fonctionnalités

### Instructions de Test dans Foundry VTT
1. **Redémarrer Foundry VTT** pour charger les nouvelles fonctionnalités
2. **Créer un acteur NPC** ou ouvrir un NPC existant
3. **Tester les jets de caractéristiques** avec les boutons 🎯
4. **Modifier les bonus** dans les champs verts
5. **Tester les jets d'attaques** avec les boutons ⚔️
6. **Utiliser les compétences** avec les boutons ⭐
7. **Vérifier l'affichage** dans le chat

## 🎯 Exemples d'Utilisation

### Jet de Caractéristique
```
🎯 Acuité
Gandalf le Gris
Résultat: 15 (normal)
Formule: 3d4+3
Dés: 4, 3, 5
Bonus appliqué: +3
```

### Jet d'Attaque
```
⚔️ Baguette Magique
Gandalf le Gris
Résultat: 28 (normal)
Formule: 1d20+8
Dés: 20
Description: Lance un rayon de lumière aveuglante
```

### Utilisation de Compétence
```
⭐ Lumières
Gandalf le Gris
Description: Crée une lumière magique qui éclaire une zone de 20 mètres
```

## 🚀 Avantages du Système

### Pour les MJs
- **Rapidité** : Jets de dés en un clic
- **Flexibilité** : Formules personnalisables pour chaque attaque
- **Visibilité** : Résultats clairs dans le chat
- **Gestion des bonus** : Système intégré pour les modificateurs

### Pour les Joueurs
- **Transparence** : Tous les jets sont visibles dans le chat
- **Clarté** : Résultats et formules clairement affichés
- **Immersion** : Descriptions intégrées dans les jets
- **Feedback** : Animations et couleurs pour les résultats importants

## 🎨 Améliorations de Style

### Contraste et Lisibilité
- **Fond principal** : #f8f9fa (gris très clair)
- **Texte principal** : #212529 (noir profond)
- **Titres** : #495057 (gris foncé)
- **Bordures** : #6c757d (gris moyen)

### Organisation des Messages
- **Attaques** : Titre → Nom NPC → Résultat → Détails → Description
- **Compétences** : Titre → Nom NPC → Description
- **Caractéristiques** : Titre → Nom NPC → Résultat → Détails → Bonus

### Suppression des Emojis
- **Titres épurés** : Plus d'emojis dans les en-têtes des messages
- **Apparence professionnelle** : Style sobre et élégant
- **Cohérence visuelle** : Uniformité dans tout le chat

## 🔮 Évolutions Futures

### Phase 3 : Combat Avancé
- Calculs automatiques de dégâts
- Conditions de combat et effets spéciaux
- Actions de combat avancées
- Système de résistance et immunités

### Améliorations Possibles
- **Historique des jets** : Sauvegarde des derniers jets
- **Statistiques** : Suivi des succès/échecs
- **Macros** : Création de jets personnalisés
- **Intégration** : Liaison avec d'autres systèmes

---

*Développé pour le système Void Horizon - Version 2.1*
