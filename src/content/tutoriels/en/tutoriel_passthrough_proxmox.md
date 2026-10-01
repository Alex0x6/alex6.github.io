---
title: "Passthrough Nvidia GPU Proxmox without iGPU"
date: 2025-10-15
description: "Guide to setting up an Nvidia GPU passthrough on Proxmox."
cover: "/images/tuto/gpu-passtrough/nvidia-rtx.jpg"
tags: ["proxmox", "passthrough-gpu", "nvidia", "homelab", "vfio", "grub", "gaming"]
lang: en
draft: false
---

## Why this tutorial?

I personally spent 8 hours trying to figure out why I was getting a black screen when booting my VM. Therefore, I want to share my experience to save you some time.

## My Use Case

I use custom GRUB entries along with a service and a script to automatically launch my gaming VM (Windows 11) and my dev VM (Omarchy).

## Knowledge Limitations

I do not know if this tutorial works on GPUs older than the NVIDIA 50xx series.
If you have the opportunity to test this on different architectures and can leave feedback in the comments or on Discord, I would be more than happy to share the results.

## Problem Explanation

The issue is that without an iGPU, or if your monitor is plugged directly into the graphics card, Proxmox will use it to display its console (along with the connection IP). This prevents you from passing the graphics card through properly to a virtual machine.

## Hardware Used

For this tutorial, I used an RTX 5070 Ti, an Intel Core i5-14600KF, and 64GB of RAM.

---

## Step 1: Install your preferred OS

Install the OS without adding the graphics card to the VM just yet.
Configure the machine type to **q35**.
Personally, to install the OS, I keep the default *Display* setting and configure the system via the Proxmox console.

---

## Step 2: Configure GRUB
> **⚠ Warning:** the scripts are "vibe coded" (written pretty informally).

Here, as you can see, the version will automatically update in GRUB with every kernel update.
I use `/etc/grub.d/40_custom` because I am adding entries to GRUB. If you want this to apply directly to the default boot menu, use the `/etc/default/grub` file instead.

I added the `pve_autostart` parameter so I can later automatically start the VM corresponding to the ID.

You must modify the line `--set=root 1791833e-9ce2-4cde-aed8-4f554e9bc5b9` to match the output of your command: 
```bash
lsblk -o NAME,FSTYPE,UUID,MOUNTPOINT
```

![lsblk](/images/tuto/gpu-passtrough/lsblk.jpg)

You also need to adjust the parameters `video=efifb:off vfio-pci.ids=10de:2c05,10de:22e9`.
To get your own IDs, use the command: 
```bash
lspci -nn | grep -E "VGA|3D|Audio"
```
![lspci](/images/tuto/gpu-passtrough/lspci.jpg)

If you are on an AMD processor, you will need to replace:
`intel_iommu=on` with `amd_iommu=on`.


### File `/etc/grub.d/40_custom`
```bash
#!/bin/sh

# Dynamic script to find the kernel

LATEST_KERNEL=$(ls -1 /boot/vmlinuz-*pve 2>/dev/null | sort -V | tail -n 1 | sed 's|^/boot/||')

LATEST_INITRD=$(ls -1 /boot/initrd.img-*pve 2>/dev/null | sort -V | tail -n 1 | sed 's|^/boot/||')

if [ -z "$LATEST_KERNEL" ]; then exit 0; fi

cat << EOF

# --- PROFILE 1: GAMING (Passes the GPU and starts VM 101) ---

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

# --- PROFILE 2: HOME-DEV (Standard Proxmox and starts VM 100) ---

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
# You can add as many "menuentry" blocks as you want here.

EOF

SCRIPT_EOF
```

If you want to keep a single entry in your GRUB, you can modify the default GRUB.

Once again, you must modify `--set=root 1791833e-9ce2-4cde-aed8-4f554e9bc5b9` to match the output of the command: 
```bash
lsblk -o NAME,FSTYPE,UUID,MOUNTPOINT
```

![blkid](/images/tuto/gpu-passtrough/lsblk.jpg)

As well as `video=efifb:off vfio-pci.ids=10de:2c05,10de:22e9`.
To get the correct IDs, use the command: 
```bash
lspci -nn | grep -E "VGA|3D|Audio"
```

If you are on an AMD processor, you will need to change:
`intel_iommu=on` to `amd_iommu=on`.

![lspci](/images/tuto/gpu-passtrough/lspci.jpg)

### File `/etc/default/grub`
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

## Step 3: Add the graphics card

Now, you can add the graphics card to the VM.
You must check the following options:
- **Primary GPU**
- **PCI-Express**
- **ROM-Bar**

> **⚠ Warning:** Do NOT check *All Functions*.

![addcg1](/images/tuto/gpu-passtrough/addcg1.png)

![addcg2](/images/tuto/gpu-passtrough/addcg2.png)

## Step 4: Change the display

You need to change the *Display* parameter and set it to **None**.

![changedisplay](/images/tuto/gpu-passtrough/editdisplay.png)

---
## Configuration example of my Omarchy VM

![configvmomarchy](/images/tuto/gpu-passtrough/configvmomarchy.png)

## Step 5: Configure the script and the service

> **⚠️ Warning:** the scripts are "vibe coded".

To get a display on our screen without launching the VM from the Proxmox interface, I created a service and a script.

### File `/etc/systemd/system/vm-autostart.service`
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

Then, run the following command:
```bash
sudo systemctl enable vm-autostart.service
```

### File `/usr/local/bin/start-gaming-vm.sh`
```bash
#!/bin/bash

# Wait for the Proxmox API to be ready
sleep 15

# Use grep with a regex to extract the number behind pve_autostart=
VMS_TO_START=$(grep -oP 'pve_autostart=\K[0-9]+' /proc/cmdline)

# If the variable is not empty (meaning a boot order was found)
if [ -n "$VMS_TO_START" ]; then
    for VMID in $VMS_TO_START; do
        echo "Order received from GRUB: Starting VM $VMID..."
        qm start "$VMID"
    done
else
    echo "No pve_autostart keyword found in GRUB. Standard boot."
fi
```

Make this script executable with the following command:
```bash
sudo chmod +x /usr/local/bin/start-gaming-vm.sh
```

## Step 6: Update GRUB and initramfs

Finally, to apply all changes related to GRUB and the kernel modules, run the following commands:
```bash
sudo update-grub
sudo update-initramfs -u -k all
```

## Conclusion

I hope this tutorial was helpful to you!

Feel free to leave a comment or come chat about it on Discord: 
[https://discord.gg/t2wZEk3rZm](https://discord.gg/t2wZEk3rZm)