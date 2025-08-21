# 🔧 Correctifs pour la Création d'Acteurs NPC

## 🎯 Problème Identifié
Le type "NPC" n'apparaissait pas dans la liste déroulante lors de la création d'un nouvel acteur dans Foundry VTT.

## 🔍 Cause Racine
Le fichier `template.json` ne définissait que le type "heros" et ne contenait pas de modèle de données pour les NPCs.

## ✅ Solutions Appliquées

### 1. **template.json** - Ajout du type NPC
```json
"Actor": {
    "types": [
        "heros",
        "npc"  // ← AJOUTÉ
    ],
    // ...
    "npc": {  // ← NOUVEAU MODÈLE COMPLET
        "name": "NPC",
        "img": "systems/voidHorizon/assets/icons/npc.svg",
        "templates": ["background", "resources"],
        "system": {
            "type": "enemy",
            "level": 1,
            "description": "Un nouveau NPC",
            "resources": {
                "health": {"value": 10, "max": 10, "label": "Points de vie"},
                "shield": {"value": 0, "max": 0, "label": "Points de bouclier"},
                "mana": {"value": 0, "max": 0, "label": "Points de mana"}
            },
            "acuite": {"value": "3d4", "label": "Acuité"},
            "pimpance": {"value": "3d4", "label": "Pimpance"},
            "martialite": {"value": "3d4", "label": "Martialité"},
            "arcane": {"value": "2d4", "label": "Arcane"},
            "attacks": {"type": "Array", "default": []},
            "skills": {"type": "Array", "default": []},
            "notes": ""
        }
    }
}
```

### 2. **scripts/npc-sheet.js** - Nettoyage
- Suppression du hook `createActor` (redondant avec template.json)
- Conservation de l'enregistrement de la fiche et des méthodes de gestion

### 3. **Fichiers déjà configurés** (pas de changement nécessaire)
- ✅ `system.json` : type "npc" dans `documentTypes.Actor.types`
- ✅ `voidHorizon.js` : import du script NPC
- ✅ `templates/sheets/npc-sheet.html` : template de la fiche
- ✅ `styles/npc-sheet.css` : styles de la fiche

## 🧪 Test à Effectuer

### Dans Foundry VTT :
1. **Redémarrer Foundry VTT** (pour recharger template.json)
2. **Aller dans l'onglet "Acteurs"**
3. **Cliquer sur "Créer un acteur"**
4. **Vérifier que "NPC" apparaît maintenant dans la liste**
5. **Créer un acteur NPC et vérifier :**
   - La fiche s'ouvre correctement
   - Les valeurs par défaut sont appliquées :
     - Type : Ennemi
     - Niveau : 1
     - PV : 10/10
     - Bouclier : 0/0
     - Mana : 0/0
     - Acuité : 3d4 - Éveillé
     - Pimpance : 3d4 - Éveillé
     - Martialité : 3d4 - Éveillé
     - Arcane : 2d4 - Insensible

### Vérifications console :
- Message "Enregistrement de la fiche NPC" dans les logs
- Aucune erreur JavaScript

## 🚨 Attention
**Il est CRUCIAL de redémarrer Foundry VTT** car les modifications du fichier `template.json` ne sont prises en compte qu'au démarrage du système.

## 📁 Fichiers Modifiés
- `template.json` : Ajout du type et modèle NPC
- `scripts/npc-sheet.js` : Nettoyage des hooks redondants
- `NPC_SHEET_README.md` : Mise à jour de la documentation

## ✨ Résultat Attendu
Après redémarrage, le type "NPC" devrait apparaître dans la liste de création d'acteurs et permettre la création d'acteurs NPC avec tous les systèmes d'attaques et compétences fonctionnels.
