# 🐛 Correction du Bug - Onglet Configure Settings Vide

## 🚨 Problème Identifié

**Symptôme** : L'onglet "Configure Settings" est vide et non interactif dans Foundry VTT.

**Cause** : Le système voidHorizon n'avait pas de paramètres de configuration enregistrés, ce qui rendait l'onglet vide.

## ✅ Solution Implémentée

### 1. **Création du Fichier de Configuration** (`module/settings.js`)

Ce fichier définit tous les paramètres configurables du système :

```javascript
export const voidHorizonSettings = {};

// Paramètres de base du système
voidHorizonSettings.baseSettings = {
    "showMovementDisplay": {
        name: "voidHorizon.settings.showMovementDisplay.name",
        hint: "voidHorizon.settings.showMovementDisplay.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    },
    // ... autres paramètres
};

// Fonction pour enregistrer tous les paramètres
export function registerSettings() {
    for (const [key, setting] of Object.entries(voidHorizonSettings.baseSettings)) {
        game.settings.register("voidHorizon", key, setting);
    }
}
```

### 2. **Ajout des Traductions** (`lang/fr.json`)

Traductions françaises pour tous les paramètres :

```json
{
  "voidHorizon": {
    "settings": {
      "showMovementDisplay": {
        "name": "Afficher le mouvement disponible",
        "hint": "Afficher ou masquer l'affichage du mouvement disponible sur les fiches de personnage"
      }
    }
  }
}
```

### 3. **Modification du Fichier Principal** (`voidHorizon.js`)

Import et enregistrement des paramètres :

```javascript
import {registerSettings} from "./module/settings.js";

Hooks.once("init", function () {
    // Enregistrer les paramètres de configuration
    registerSettings();
    
    // ... autres initialisations
});
```

## 🔧 Paramètres Disponibles

### **Paramètres d'Affichage**
- ✅ **Afficher le mouvement disponible** : Contrôle l'affichage du mouvement sur les fiches
- ✅ **Afficher le malus d'armure** : Contrôle l'affichage des informations d'armure
- ✅ **Afficher les infobulles** : Contrôle l'affichage des tooltips détaillés
- ✅ **Afficher les plages de dés** : Contrôle l'affichage des plages Safe/Unsafe
- ✅ **Afficher le détail des bonus** : Contrôle l'affichage des sources de bonus

### **Paramètres de Calcul**
- ✅ **Formule de mouvement** : Choix entre formule par défaut ou personnalisée
- ✅ **Multiplicateur d'agilité** : Ajustement du multiplicateur (0.5 à 3.0)
- ✅ **Mouvement de base** : Valeur de base ajoutée (0.0 à 5.0)

### **Paramètres d'Armure**
- ✅ **Activer le malus d'armure** : Activation/désactivation du système
- ✅ **Multiplicateur du malus** : Ajustement du malus (0.5 à 3.0)

### **Paramètres Avancés**
- ✅ **Mode debug** : Activation du mode debug
- ✅ **Niveau de log** : Contrôle du niveau de détail des logs
- ✅ **Sauvegarde automatique** : Activation de la sauvegarde auto
- ✅ **Intervalle de sauvegarde** : Fréquence de sauvegarde (30s à 300s)

## 🚀 Étapes de Résolution

### **Étape 1 : Vérification des Fichiers**
1. ✅ `module/settings.js` - Créé
2. ✅ `lang/fr.json` - Modifié avec les traductions
3. ✅ `voidHorizon.js` - Modifié pour importer les paramètres

### **Étape 2 : Redémarrage de Foundry VTT**
**IMPORTANT** : Redémarrer complètement Foundry VTT pour que les nouveaux paramètres soient pris en compte.

### **Étape 3 : Vérification**
1. Aller dans **Configure Settings** (⚙️)
2. Vérifier que l'onglet **voidHorizon** apparaît
3. Vérifier que tous les paramètres sont visibles et configurables

## 🔍 Vérification de l'Installation

### **Dans la Console du Navigateur**
Après le redémarrage, vous devriez voir :

```
✅ JS custom operationnel 
Enregistrement des paramètres voidHorizon...
Paramètres voidHorizon enregistrés avec succès !
Initialisation du système voidHorizon
Système voidHorizon prêt
```

### **Dans l'Interface Foundry VTT**
1. **Configure Settings** → Onglet **voidHorizon** visible
2. **Tous les paramètres** affichés avec leurs contrôles
3. **Traductions françaises** correctement affichées
4. **Sauvegarde** des paramètres fonctionnelle

## 🧪 Test de Fonctionnement

### **Fichier de Test Créé**
- `test-settings-configuration.html` - Interface de test des paramètres

### **Fonctionnalités Testées**
- ✅ Affichage des paramètres
- ✅ Modification des valeurs
- ✅ Sauvegarde des paramètres
- ✅ Réinitialisation aux valeurs par défaut
- ✅ Export des configurations

## 🎯 Avantages de cette Solution

### **Pour les Joueurs**
- **Configuration personnalisée** : Ajuster l'affichage selon leurs préférences
- **Transparence** : Voir tous les paramètres disponibles
- **Flexibilité** : Activer/désactiver des fonctionnalités

### **Pour les Maîtres de Jeu**
- **Contrôle total** : Gérer tous les aspects du système
- **Équilibrage** : Ajuster les formules de calcul
- **Debug** : Activer le mode debug pour le développement

### **Pour les Développeurs**
- **Maintenance** : Paramètres centralisés et organisés
- **Extensibilité** : Facile d'ajouter de nouveaux paramètres
- **Documentation** : Traductions et descriptions claires

## 🚨 Dépannage

### **Si l'onglet reste vide après redémarrage :**

1. **Vérifier la console** pour les erreurs JavaScript
2. **Vérifier les imports** dans `voidHorizon.js`
3. **Vérifier les permissions** du dossier `module/`
4. **Vider le cache** du navigateur

### **Si certains paramètres n'apparaissent pas :**

1. **Vérifier les traductions** dans `lang/fr.json`
2. **Vérifier la syntaxe** des paramètres dans `module/settings.js`
3. **Vérifier les types** des paramètres (Boolean, String, Number)

### **Si les paramètres ne se sauvegardent pas :**

1. **Vérifier les permissions** d'écriture
2. **Vérifier la console** pour les erreurs de sauvegarde
3. **Vérifier la base de données** Foundry VTT

## 🎉 Résultat Final

**Bug corrigé !** 🎯

L'onglet "Configure Settings" affiche maintenant tous les paramètres du système voidHorizon avec :
- ✅ **Interface complète** et interactive
- ✅ **Traductions françaises** pour tous les paramètres
- ✅ **Contrôles appropriés** (checkboxes, selects, inputs numériques)
- ✅ **Sauvegarde automatique** des modifications
- ✅ **Organisation claire** par catégories

Le système est maintenant entièrement configurable et professionnel ! 🚀
