---
# Exemple de tutoriel en français
# Chemin : src/content/tutoriels/fr/introduction-proxmox.md

title: "Introduction à Proxmox VE : Installer un homelab"
date: 2025-06-15
description: "Guide pas à pas pour installer Proxmox VE sur du matériel bare-metal et configurer vos premières VMs et conteneurs LXC."
# cover: "/images/proxmox-gui.png"   ← décommentez quand l'image est dans public/images/
tags: ["proxmox", "virtualisation", "homelab", "linux"]
lang: fr
draft: false
---

## Pourquoi Proxmox VE ?

[Proxmox VE](https://www.proxmox.com/) est une plateforme de virtualisation open-source qui combine **KVM** (machines virtuelles complètes) et **LXC** (conteneurs légers) dans une interface web unifiée.

Ses avantages pour un homelab :
- **Gratuit** (sans abonnement obligatoire)
- Interface web complète
- Support des clusters HA
- Snapshots & backups intégrés

---

## Architecture de la solution

Voici l'architecture que nous allons mettre en place :

```
[Serveur physique]
 └── Proxmox VE
      ├── VM 1 : TrueNAS (stockage NAS)
      ├── VM 2 : OPNsense (pare-feu)
      └── CT 1 : Nginx Proxy Manager (reverse proxy)
```

Vous pouvez aussi utiliser un schéma :

![Architecture Proxmox](/images/proxmox-gui.png)

---

## Étape 1 : Téléchargement et création de la clé USB

Téléchargez l'ISO depuis [proxmox.com/downloads](https://www.proxmox.com/en/downloads) puis créez une clé USB bootable :

```bash
# Avec dd (Linux/macOS) – remplacez /dev/sdX par votre périphérique USB
sudo dd if=proxmox-ve_8.x-x.iso of=/dev/sdX bs=1M status=progress conv=fsync
```

> **⚠️ Attention :** cette commande efface intégralement le contenu de `/dev/sdX`. Vérifiez bien la cible avant d'exécuter.

---

## Étape 2 : Installation

1. Démarrez sur la clé USB (F11 / F12 au POST)
2. Choisissez **Install Proxmox VE (Graphical)**
3. Sélectionnez le disque de destination (ZFS recommandé pour le mirroring)
4. Configurez réseau, mot de passe root, email d'alerte
5. Finalisez et rebootez

---

## Étape 3 : Première connexion

Accédez à l'interface web :

```
https://<IP_DU_SERVEUR>:8006
```

Identifiants : `root` / mot de passe configuré à l'installation.

---

## Conclusion

Vous avez maintenant un hyperviseur Proxmox fonctionnel. Dans les prochains articles, nous verrons comment :

- Créer et optimiser vos premières VMs
- Configurer le stockage ZFS
- Mettre en place les sauvegardes automatiques avec PBS
