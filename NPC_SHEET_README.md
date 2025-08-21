# 📋 Fiche NPC - Void Horizon

## 🎯 Vue d'ensemble

La fiche NPC (Non-Player Character) est un nouveau type d'acteur dans le système Void Horizon, conçu pour représenter les personnages de l'environnement, les ennemis et les alliés des joueurs.

## ✨ Fonctionnalités

### 🔧 Propriétés de base
- **Nom** : Nom du NPC
- **Type** : Ennemi, Neutre ou Allié
- **Niveau** : Niveau de difficulté (1-20)
- **Description** : Description textuelle du NPC

### 💖 Ressources
- **Points de Vie (PV)** : Santé actuelle et maximale
- **Bouclier** : Protection actuelle et maximale
- **Mana** : Énergie magique actuelle et maximale

### 📊 Caractéristiques
- **Acuité** : Perception et précision (2d4 à 7d4)
- **Pimpance** : Charisme et influence sociale (2d4 à 7d4)
- **Martialité** : Compétences de combat (2d4 à 7d4)
- **Arcane** : Puissance magique (2d4 à 7d4)

### ⚔️ Attaques
- **Nom** : Nom de l'attaque
- **Lancer de dé** : Formule de dés personnalisable (ex: 1d20+5, 2d6+3)
- **Description** : Description qui apparaîtra lors du lancer de dé
- **Gestion dynamique** : Ajout/suppression d'attaques à volonté

### 🎯 Compétences
- **Nom** : Nom de la compétence
- **Description** : Description détaillée de la compétence
- **Gestion dynamique** : Ajout/suppression de compétences à volonté

## 🎮 Utilisation

### 1. Création d'un NPC
1. Ouvrir Foundry VTT
2. Aller dans l'onglet "Acteurs"
3. Cliquer sur "Créer un acteur"
4. Sélectionner le type "NPC"
5. Remplir les informations de base
6. **Les valeurs par défaut sont automatiquement appliquées** :
   - Type : Ennemi
   - Niveau : 1
   - PV : 10/10
   - Bouclier : 0/0
   - Mana : 0/0
   - Acuité : 3d4 (Éveillé)
   - Pimpance : 3d4 (Éveillé)
   - Martialité : 3d4 (Éveillé)
   - Arcane : 2d4 (Insensible)

### 2. Configuration des ressources
- **PV** : Définir la santé maximale selon le niveau et la race
- **Bouclier** : Définir la protection selon l'équipement
- **Mana** : Définir l'énergie magique selon les capacités

### 3. Ajustement des caractéristiques
- Choisir le niveau de chaque caractéristique selon le rôle du NPC
- Les valeurs vont de "Insensible" (2d4) à "Archimage" (7d4)

### 4. Ajout d'attaques et compétences
- **Attaques** : Cliquer sur "Ajouter" pour créer une nouvelle attaque
- **Compétences** : Cliquer sur "Ajouter" pour créer une nouvelle compétence
- Tous les champs sont éditables et sauvegardés automatiquement

## 📁 Structure des fichiers

```
voidHorizon/
├── scripts/
│   └── npc-sheet.js          # Logique JavaScript de la fiche
├── templates/sheets/
│   └── npc-sheet.html        # Template HTML de la fiche
├── styles/
│   └── npc-sheet.css         # Styles CSS de la fiche
└── test-npc-sheet.html       # Fichier de test
```

## 🔮 Développements futurs

### ✅ Phase 1 : Base (Terminée)
- ✅ Fiche NPC avec ressources et caractéristiques
- ✅ Système d'attaques avec lancers de dés personnalisables
- ✅ Système de compétences avec descriptions
- ✅ Interface utilisateur moderne et responsive

### Phase 2 : Combat avancé
- Système de lancers de dés intégré
- Calculs automatiques de dégâts
- Conditions de combat et effets spéciaux
- Actions de combat avancées

### Phase 3 : Inventaire
- Équipement et objets portés
- Trésors et butin
- Gestion du poids et de l'encombrement

### Phase 4 : IA et comportement
- Patterns de combat
- Réactions aux événements
- Intelligence artificielle pour les NPC

## 🧪 Test et développement

### Fichier de test
Le fichier `test-npc-sheet.html` permet de tester :
- Le rendu visuel de la fiche
- La navigation entre les onglets
- Les interactions avec les formulaires
- **La gestion des attaques** (ajout, suppression, modification)
- **La gestion des compétences** (ajout, suppression, modification)
- La responsivité sur différents écrans

### Comment tester
1. Ouvrir `test-npc-sheet.html` dans un navigateur
2. Naviguer entre les onglets
3. Modifier les valeurs des ressources
4. Changer les caractéristiques
5. **Tester les attaques** :
   - Cliquer sur "Ajouter" pour créer une nouvelle attaque
   - Modifier le nom, la formule de dés et la description
   - Supprimer une attaque avec le bouton 🗑️
6. **Tester les compétences** :
   - Cliquer sur "Ajouter" pour créer une nouvelle compétence
   - Modifier le nom et la description
   - Supprimer une compétence avec le bouton 🗑️
7. Utiliser les contrôles de test

## 🎨 Personnalisation

### Couleurs et thème
La fiche utilise le thème Void Horizon avec :
- Couleurs sombres et professionnelles
- Accents rouges et oranges
- Effets de transparence et de flou

### Responsive Design
- Adaptation automatique aux écrans mobiles
- Grilles flexibles pour les ressources
- Navigation adaptative

## 📝 Notes techniques

### Structure des données
```javascript
{
  name: "Nom du NPC",
  system: {
    type: "enemy|neutral|ally",
    level: 1-20,
    description: "Description textuelle",
    resources: {
      health: { value: 0, max: 0 },
      shield: { value: 0, max: 0 },
      mana: { value: 0, max: 0 }
    },
    acuite: { value: "2d4" },
    pimpance: { value: "2d4" },
    martialite: { value: "2d4" },
    arcane: { value: "2d4" },
    attacks: [
      {
        name: "Nom de l'attaque",
        dice: "1d20+5",
        description: "Description de l'attaque"
      }
    ],
    skills: [
      {
        name: "Nom de la compétence",
        description: "Description de la compétence"
      }
    ],
    notes: "Notes additionnelles"
  }
}
```

### Événements gérés
- Changements de ressources (PV, bouclier, mana)
- Modifications des caractéristiques
- Navigation entre les onglets
- **Gestion des attaques** (ajout, suppression, modification)
- **Gestion des compétences** (ajout, suppression, modification)
- Sauvegarde automatique des données

## 🚀 Intégration avec Foundry VTT

### Enregistrement
La fiche NPC s'enregistre automatiquement dans Foundry VTT via le hook `Hooks.once("init")`.

### Compatibilité
- Compatible avec Foundry VTT v11+
- Utilise l'API standard des fiches d'acteurs
- Intègre le système de données Void Horizon

## 📞 Support et développement

### Problèmes connus
- Aucun problème connu actuellement

### Améliorations suggérées
- Ajout d'icônes pour les ressources
- Barres de progression visuelles
- Système de templates prédéfinis

### Contribution
Les contributions sont les bienvenues pour améliorer :
- L'interface utilisateur
- Les fonctionnalités
- La documentation
- Les tests

---

*Développé pour le système Void Horizon - Version 1.0*
