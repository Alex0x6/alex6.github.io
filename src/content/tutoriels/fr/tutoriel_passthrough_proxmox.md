---
title: "Passthrough Nvidia GPU Proxmox sans iGPU"
date: 2025-10-15
description: "Guide pour faire un passthrough GPU Nvidia sur Proxmox."
cover: "/public/images/tuto/gpu-passtrough/nvidia-rtx.jpg"
tags: ["proxmox", "passthrough-gpu", "nvidia", "homelab", "vfio", "grub", "gaming"]
lang: fr
draft: false
---

## Pourquoi ce tuto ?

J'ai personnellement passé 8 heures à chercher pourquoi j'avais un écran noir au démarrage de ma VM. Je souhaite donc partager mon expérience pour vous faire gagner du temps.

## Mon utilisation

J'utilise les entrées personnalisées de GRUB avec un service et un script pour pouvoir lancer ma VM gaming (Windows 11) et ma VM de dev (Omarchy) automatiquement.

## Limites de connaissances

Je ne sais pas si ce tutoriel fonctionne sur les cartes inférieures à la série 50xx de NVIDIA.
Si vous avez la possibilité de tester sur différentes architectures et de faire un retour en commentaire ou sur Discord, ce serait avec un immense plaisir que je partagerais les résultats.

## Explication du problème

Le problème est que sans iGPU, ou si vous avez l'écran branché directement sur la carte graphique, Proxmox va utiliser cette dernière pour afficher sa console (avec l'IP de connexion). Cela empêche de pouvoir utiliser la carte graphique proprement sur une machine virtuelle.

## Équipement utilisé

Pour ce tutoriel, j'ai utilisé une RTX 5070 Ti, un Intel Core i5-14600KF et 64 Go de RAM.

---

## Étape 1 : Installer l'OS de votre choix

Installez l'OS sans ajouter la carte graphique à la VM pour le moment.
Configurez la machine en **q35**.
Personnellement, pour installer l'OS, je garde le *Display* par défaut et je configure le système via la console de Proxmox.

---

## Étape 2 : Configurer GRUB
> **⚠️️ Attention :** les scripts sont "vibes codés".

Ici, comme vous pouvez le voir, à chaque mise à jour du noyau, la version se mettra à jour automatiquement dans le GRUB.
J'utilise `/etc/grub.d/40_custom` car je rajoute des entrées au GRUB. Si vous voulez que cela s'applique directement au menu de démarrage de base, utilisez le fichier `/etc/default/grub`.

J'ai rajouté le paramètre `pve_autostart` pour pouvoir ensuite lancer automatiquement la VM correspondant à l'ID.

Vous devez modifier la ligne `--set=root 1791833e-9ce2-4cde-aed8-4f554e9bc5b9` pour qu'elle corresponde à la sortie de votre commande : 
```bash
lsblk -o NAME,FSTYPE,UUID,MOUNTPOINT
```

![lsblk](/public/images/tuto/gpu-passtrough/lsblk.jpg)

Vous devez également adapter les paramètres `video=efifb:off vfio-pci.ids=10de:2c05,10de:22e9`.
Pour obtenir vos propres ID, utilisez la commande : 
```bash
lspci -nn | grep -E "VGA|3D|Audio"
```
![lspci](/public/images/tuto/gpu-passtrough/lspci.jpg)

Si vous êtes sur un processeur AMD, vous devrez remplacer :
`intel_iommu=on` par `amd_iommu=on`.


### Fichier `/etc/grub.d/40_custom`
```bash
#!/bin/sh

# Script dynamique pour trouver le noyau

LATEST_KERNEL=$(ls -1 /boot/vmlinuz-*pve 2>/dev/null | sort -V | tail -n 1 | sed 's|^/boot/||')

LATEST_INITRD=$(ls -1 /boot/initrd.img-*pve 2>/dev/null | sort -V | tail -n 1 | sed 's|^/boot/||')

if [ -z "$LATEST_KERNEL" ]; then exit 0; fi

cat << EOF

# --- PROFIL 1 : GAMING (Passe le GPU et démarre la VM 101) ---

menuentry 'Proxmox VE - GAMING (VM 101)' --class proxmox --class gnu-linux --class gnu --class os {

load_video

insmod gzio

insmod part_gpt

insmod lvm

insmod ext2

search --no-floppy --fs-uuid --set=root 1791833e-9ce2-4cde-aed8-4f554e9bc5b9

linux /boot/\${LATEST_KERNEL} root=/dev/mapper/pve-root ro quiet nvme_core.default_ps_max_latency_us=0 pcie_aspm=off intel_iommu=on iommu=pt initcall_blacklist=simpledrm_platform_driver_init video=efifb:off vfio-pci.ids=10de:2c05,10de:22e9 module_blacklist=nvidia,nvidia_drm,nvidia_uvm,nvidia_modeset pve_autostart=101

initrd /boot/\${LATEST_INITRD}

}

# --- PROFIL 2 : HOME-DEV (Standard Proxmox et démarre la VM 100) ---

menuentry 'Proxmox VE - DEV (VM 100)' --class proxmox --class gnu-linux --class gnu --class os {

load_video

insmod gzio

insmod part_gpt

insmod lvm

insmod ext2

search --no-floppy --fs-uuid --set=root 1791833e-9ce2-4cde-aed8-4f554e9bc5b9

linux /boot/\${LATEST_KERNEL} root=/dev/mapper/pve-root ro quiet pve_autostart=100

initrd /boot/\${LATEST_INITRD}

}
# Tu peux rajouter autant de blocs "menuentry" que tu le souhaites ici.

EOF

SCRIPT_EOF
```

Si vous voulez garder une seule entrée dans votre GRUB, vous pouvez modifier le GRUB par défaut.

Là encore, vous devez modifier `--set=root 1791833e-9ce2-4cde-aed8-4f554e9bc5b9` pour qu'il corresponde à la sortie de la commande : 
```bash
lsblk -o NAME,FSTYPE,UUID,MOUNTPOINT
```

![blkid](/public/images/tuto/gpu-passtrough/lsblk.jpg)

Ainsi que `video=efifb:off vfio-pci.ids=10de:2c05,10de:22e9`.
Pour obtenir les bons ID, utilisez la commande : 
```bash
lspci -nn | grep -E "VGA|3D|Audio"
```

Si vous êtes sur un processeur AMD, vous devrez changer :
`intel_iommu=on` par `amd_iommu=on`.

![lspci](/public/images/tuto/gpu-passtrough/lspci.jpg)

### Fichier `/etc/default/grub`
```bash
# If you change this file or any /etc/default/grub.d/*.cfg file,
# run 'update-grub' afterwards to update /boot/grub/grub.cfg.
# For full documentation of the options in these files, see:
#   info -f grub -n 'Simple configuration'

GRUB_DEFAULT=0
GRUB_TIMEOUT=5
GRUB_DISTRIBUTOR=`( . /etc/os-release && echo ${NAME} )`
GRUB_CMDLINE_LINUX_DEFAULT="quiet nvme_core.default_ps_max_latency_us=0 pcie_aspm=off amd_iommu=on iommu=pt initcall_blacklist=simpledrm_platform_driver_init video=efifb:off vfio-pci.ids=10de:2c05,10de:22e9 module_blacklist=nvidia,nvidia_drm,nvidia_uvm,nvidia_modeset pve_autostart=101"
GRUB_CMDLINE_LINUX=""

# If your computer has multiple operating systems installed, then you
# probably want to run os-prober. However, if your computer is a host
# for guest OSes installed via LVM or raw disk devices, running
# os-prober can cause damage to those guest OSes as it mounts
# filesystems to look for things.
#GRUB_DISABLE_OS_PROBER=false

# Uncomment to enable BadRAM filtering, modify to suit your needs
# This works with Linux (no patch required) and with any kernel that obtains
# the memory map information from GRUB (GNU Mach, kernel of FreeBSD ...)
#GRUB_BADRAM="0x01234567,0xfefefefe,0x89abcdef,0xefefefef"

# Uncomment to disable graphical terminal
#GRUB_TERMINAL=console

# The resolution used on graphical terminal
# note that you can use only modes which your graphic card supports via VBE/GOP/UGA
# you can see them in real GRUB with the command `videoinfo'
#GRUB_GFXMODE=640x480

# Uncomment if you don't want GRUB to pass "root=UUID=xxx" parameter to Linux
#GRUB_DISABLE_LINUX_UUID=true

# Uncomment to disable generation of recovery mode menu entries
#GRUB_DISABLE_RECOVERY="true"

# Uncomment to get a beep at grub start
#GRUB_INIT_TUNE="480 440 1"
```

## Étape 3 : Ajouter la carte graphique

Maintenant, vous pouvez ajouter la carte graphique à la VM.
Vous devez cocher les options suivantes :
- **Primary GPU**
- **PCI-Express**
- **ROM-Bar**

> **⚠ Attention :** Ne cochez pas *All Functions*.

![addcg1](/public/images/tuto/gpu-passtrough/addcg1.png)

![addcg2](/public/images/tuto/gpu-passtrough/addcg2.png)

## Étape 4 : Changer le display

Il faut modifier le paramètre *Display* pour le définir sur **None**.

![changedisplay](/public/images/tuto/gpu-passtrough/editdisplay.png)

---
## Exemple de paramétrage de ma VM Omarchy

![configvmomarchy](/public/images/tuto/gpu-passtrough/configvmomarchy.png)

## Étape 5 : Configurer le script et le service

> **⚠️ Attention :** les scripts sont "vibes codés".

Pour avoir un affichage sur notre écran sans lancer la VM depuis l'interface de Proxmox, j'ai créé un service et un script.

### Fichier `/etc/systemd/system/vm-autostart.service`
```ini
[Unit]
Description=Autostart Windows VM ONLY in Gaming Mode
After=pve-manager.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/start-gaming-vm.sh

[Install]
WantedBy=multi-user.target
```

Ensuite, exécutez la commande suivante :
```bash
sudo systemctl enable vm-autostart.service
```

### Fichier `/usr/local/bin/start-gaming-vm.sh`
```bash
#!/bin/bash

# On attend que l'API Proxmox soit prête
sleep 15

# On utilise grep avec une regex pour extraire le numéro derrière pve_autostart=
VMS_TO_START=$(grep -oP 'pve_autostart=\K[0-9]+' /proc/cmdline)

# Si la variable n'est pas vide (donc si on a trouvé un ordre de boot)
if [ -n "$VMS_TO_START" ]; then
    for VMID in $VMS_TO_START; do
        echo "Ordre reçu de GRUB : Démarrage de la VM $VMID..."
        qm start "$VMID"
    done
else
    echo "Aucun mot-clé pve_autostart trouvé dans GRUB. Démarrage standard."
fi
```

Rendez ce script exécutable avec la commande suivante :
```bash
sudo chmod +x /usr/local/bin/start-gaming-vm.sh
```

## Étape 6 : Mettre à jour GRUB et l'initramfs

Enfin, pour appliquer toutes les modifications liées à GRUB et aux modules du noyau, exécutez les commandes suivantes :
```bash
sudo update-grub
sudo update-initramfs -u -k all
```

## Conclusion

J'espère que ce tutoriel vous a été utile !

N'hésitez pas à laisser un commentaire ou à venir en discuter sur le Discord : 
[https://discord.gg/t2wZEk3rZm](https://discord.gg/t2wZEk3rZm)