
---
# Chemin : src/content/tutoriels/fr/introduction-proxmox.md

title: "Passtrough Nvidia GPU Proxmox without igpu"
date: 2025-06-15
description: "Guide pour faire des passtrough gpu sur proxmox"
cover: "/images/proxmox-gui.png"   ← décommentez quand l'image est dans public/images/
tags: ["proxmox", "virtualisation", "homelab", "linux"]
lang: fr
draft: false
---

## Pourquoi ce tuto ?

J'ai personnellement passé 8h à chercher pourquoi est ce que j'avais un écran noir au boot de la vm et donc je veux partager mon expérience pour vous faire gagner du temps.

## Mon utilisation

J'utilise les entrées customs du grub avec un service et un script pour pouvoir lancer ma vm gaming (W11) et ma vm de dev (Omarchy) automatiquement.

## Limites de connaissances

Je ne sais pas si ce tuto fonctionne sur les carte inférieurs à la série 50xx de nvidia.
Si vous avez la possibilité de tester sur differents archi et de faire un retour en commentaire ou discord serait avec un immense plaisir que je partagerais les résultats.

## Explication problèmes

Le probleme c'est que sans igpu ou si vous avez l'ecran branché sur la carte graphique proxmox va utiliser la carte graphique pour afficher la console avec marqué l'ip de connection et empecher de pouvoir utiliser la carte sur vm proprement.

## Equipements ?

Sur ce tuto j'ai utilisé une rtx 5070 ti, un i5 14600kf et 64gb de ram.

---

## Étape 1 : Installer l'os de votre choix

Installer l'os sans ajouter encore le carte graphique à la vm.
Configuré la machine en q35.
Personellement, pour installer l'os je garde le display par défaut et je configure l'os par la console de proxmox.

---

## Étape 2 : Configurer le grub
> **⚠️ Attention :** les scripts sont vibes codés.

Ici, comme vous pouvez le voir à chaque update du noyau la version se mettra à jour automatiquement dans le grub.
J'utilise 40_custom car je rajoute des entrées au grub si vous voulez que cela s'applique directement au boot grub de base utiliser le fichier 


J'ai rajouté pve_autostart pour pouvoir ensuite lancer automatiquement la vm correspondant à l'id.

Vous devez changer : 
```--set=root 1791833e-9ce2-4cde-aed8-4f554e9bc5b9``` pour qu'il corresponde à votre sortie de la commande : ``` lsblk -o NAME,FSTYPE,UUID,MOUNTPOINT ```
![blkid](/public/images/tuto/gpu-passtrough/lsblk.jpg)

 Ainsi que ```video=efifb:off vfio-pci.ids=10de:2c05,10de:22e9```
 Pour obtenir les bons ID utliser la commande : ``` lspci -nn | grep -E "VGA|3D|Audio" ```

 Si vous etes sur un processeur amd vous devrez changer.

 ```intel_iommu=on``` par ```amd_iommu=on```

 ![lspci](/public/images/tuto/gpu-passtrough/lspci.jpg)

 # /etc/grub.d/40_custom 
```
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

Si vous voulez garder une seule entree dans votre grub vous pouvez modifier le grub par defaut.

Vous devez changer : 
```--set=root 1791833e-9ce2-4cde-aed8-4f554e9bc5b9``` pour qu'il corresponde à votre sortie de la commande : ``` lsblk -o NAME,FSTYPE,UUID,MOUNTPOINT ```
![blkid](/public/images/tuto/gpu-passtrough/lsblk.jpg)

 Ainsi que ```video=efifb:off vfio-pci.ids=10de:2c05,10de:22e9```
 Pour obtenir les bons ID utliser la commande : ``` lspci -nn | grep -E "VGA|3D|Audio" ```

 Si vous etes sur un processeur amd vous devrez changer.


 ```intel_iommu=on``` par ```amd_iommu=on```

![lspci](/public/images/tuto/gpu-passtrough/lspci.jpg)
 # /etc/default/grub
```
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

Maintenant vous pouvez ajouter la carte graphique à la vm.
Vous devez cocher :
Primary GPU;
Pci-express;
ROM-Bar
> **⚠️ Attention :** Ne pas cocher all functions.

![addcg1](/public/images/tuto/gpu-passtrough/addcg1.png)

![addcg2](/public/images/tuto/gpu-passtrough/addcg2.png)

## Étape 4 : Changer le display

Il faut changer le display pour le passer en None.

![changedisplay](/public/images/tuto/gpu-passtrough/editdisplay.png)

---
## Exemple de param'etrages de ma vm omarchy

![configvmomarchy](/public/images/tuto/gpu-passtrough/configvmomarchy.png)

## Étape 5 : Configurer le script et le service

> **⚠️ Attention :** les scripts sont vibes codés.

Pour avoir un affichage sur notre ecran sans lancer la vm depuis l'interface de promox j'ai cree un service et un script.

/etc/systemd/system/vm-autostart.service

```
[Unit]
Description=Autostart Windows VM ONLY in Gaming Mode
After=pve-manager.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/start-gaming-vm.sh

[Install]
WantedBy=multi-user.target
```
Ensuite executer

```sudo systemctl enable vm-autostart.service```

/usr/local/bin/start-gaming-vm.sh

```
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



## Conclusion

J'espere que ce tuto vous a bien servi :).

N hesiter pas a commenter et ou venir sur le discord 

https://discord.gg/t2wZEk3rZm


