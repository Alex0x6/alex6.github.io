---
title: "Introduction to Proxmox VE: Setting up a homelab"
date: 2025-06-15
description: "A step-by-step guide to install Proxmox VE on bare-metal hardware and configure your first VMs and LXC containers."
tags: ["proxmox", "virtualisation", "homelab", "linux"]
lang: en
draft: false
---

## Why Proxmox VE?

[Proxmox VE](https://www.proxmox.com/) is an open-source virtualisation platform combining **KVM** full VMs and **LXC** lightweight containers behind a unified web UI.

> This is the English version of the tutorial. See the French version at `/fr/tutoriels/introduction-proxmox`.

---

## Architecture

```
[Physical Server]
 └── Proxmox VE
      ├── VM 1 : TrueNAS (NAS storage)
      ├── VM 2 : OPNsense (firewall)
      └── CT 1 : Nginx Proxy Manager (reverse proxy)
```

![Proxmox GUI screenshot](/images/proxmox-gui.png)

---

## Step 1 – Download & bootable USB

Download the ISO from [proxmox.com/downloads](https://www.proxmox.com/en/downloads) and flash it:

```bash
sudo dd if=proxmox-ve_8.x-x.iso of=/dev/sdX bs=1M status=progress conv=fsync
```

---

## Conclusion

You now have a running Proxmox hypervisor. Next articles will cover VM creation, ZFS storage setup, and automated backups with PBS.
