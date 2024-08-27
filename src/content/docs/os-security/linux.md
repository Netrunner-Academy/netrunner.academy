---
title: Linux Security
description: A detailed look at the (nightmarish) security of Linux
---

Linux security has always been a sensitive subject in the industry, and this article will no doubt start some fires.

Before diving into the security practices of the OS, let's make two things clear. First of all, Linux runs our modern world - ChromeOS, Android phones and TVs, cars, fridges, smart devices. It's an amazing operating system and we should all appreciate it for that. Due to the widespread use of Linux, it is one of the most mission-critical pieces of software to ever exist, and as such should be held to extremely high security standards. Secondly, being Open-Source [doesn't make it secure.](https://privsec.dev/posts/knowledge/floss-security/)

This article is not meant to cause any wars, nor is it meant to call out any individual developers of the operating system. The industry widely accepts that Linux security is fundamentally flawed and needs a serious overhaul to provide the security necessary in today's world. Hopefully, this article will inform both those that are experience with Linux, and those with very little. The hope is to encourage Linux security to be better.

To prevent conflict, as with all other articles on this website, sources will frequently be referenced for all information presented.

## Architectural issues
The monolithic nature of the Kernel is a flaw of Linux in itself. While this might fall flat due to a lack of alternatives, but should still be mentioned, as it is a major limiation. Additionaly Linux doesn't have a proper threath model [nor does it have verified boot in any capacity](https://privsec.dev/posts/linux/linux-insecurities/#lack-of-verified-boot). [Secureboot](https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-secure-boot) at the time of writing is easily bypassed too. Immutable distros somewhat attemp to fix the issue of having no distinction between the system and user application, however they aren't truly immutable, and thus don't achieve their goal. 

## The Distribution Fracturing Problem

The Linux developer ecosystem is unique in many ways, with a culture and practices that differ from every other operating system. This creates a beautiful yet scary environment for reasons we'll discuss in the sections below.

### Stable Release

A large amount of distributions such as Ubuntu, Debian, RHEL, Rocky Linux, Oracle Linux, and CentOS are categorized as "stable release" Linux distributions and always use the long-term support (LTS) kernel. Stable release Linux distributions use outdated packages, only ever backporting security fixes when a CVE has been reported. While this sounds good in practice, a large amount of security vulnerabilities never get assigned a CVE, and as such are never backported to a stable release distribution.

Additionally, backports are not always a proper fix as claimed. There are [many](https://x.com/grsecurity/status/1076928429306667008) [different](https://seclists.org/oss-sec/2018/q4/110) [examples](https://x.com/grsecurity/status/1068831530125008897) of backports taking 6-12 months, and [many](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=90a7b84679dedb23660ed46976b964b8bf7f3a55) [more](https://lore.kernel.org/stable/20200922110703.720960-2-m.v.b@runbox.com/) [examples](https://www.spinics.net/lists/stable/msg328591.html) of backports either introducing a new vulnerability, or breaking something.

Research from Chainguard in 2024 analyzed over 600 open source projects which [contained over 100 security fixes that were never assigned a CVE](https://www.chainguard.dev/unchained/vulnerability-fixes-in-plain-sight-how-your-scanners-are-missing-hundreds-of-vulnerabilities).

A study from Springer in 2022 found that [37.19% of Linux kernel vulnerabilities never use terminology in the commit log to imply a security fix](https://orbilu.uni.lu/bitstream/10993/54305/1/emse-SSPCatcher-Arthur.pdf). Furthermore, this study shows that 147,746 commits contained the words "bug", "vuln", or "fix", of which only 986 were for known CVEs. It should be noted however that the exact number of commits in this dataset that correlated to fixing a vulnerability is unknown.

![](../../../assets/linux/linux_vulnerabilities.png)

A study from North Carolina state university in 2023 created a dataset of the 1000 latest commits in the NPM, Python, Go, PyPI, and Maven projects. They found that [52.86% of projects silently fixed vulnerabilities](https://enck.org/pubs/dunlap-eurosp23.pdf). 

While two of the studies cited do not specifically cover the Linux kernel, they highlight the fact that CVEs are not properly disclosed or reported within the open source community. This is particularly important because of the nature of Linux. Linux is not just a kernel; it's also the set of packages that ship with the kernel in each Linux distribution.

Debian hosts a security tracker which shows [a very large number of vulnerable packages with CVEs that have not yet received a fix](https://security-tracker.debian.org/tracker/status/release/stable).

Ubuntu has a whole blog post explaining how they fix security problems within the distribution and its packages. They have maintainers [manually check the CVE databases to see if packages within Ubuntu are vulnerable, and then manually backport each fix](https://ubuntu.com/blog/securing-open-source-through-cve-prioritisation).

### Rolling Release

Rolling release distributions tend to use the stable kernel and includes distributions such as Arch Linux. Due to using the mainline kernel, all vulnerabilities are patched even if there is no published CVE, unlike with stable releases. 

The core Linux developers claim is that [everyone should be using the latest version of the Linux kernel](https://kernel-recipes.org/en/2019/talks/cves-are-dead-long-live-the-cve/) as that's the only way to ensure you have all the latest fixes, vulnerability or not. However, this claim falls apart due to the lack of developer standards within the Linux kernel. The Linux kernel allows for new features and bug fixes to be merged without tests or fuzzing. To make matters worse, the code coverage of the Linux kernel is currently unknown. This lack of developer standards has created a culture that allows for new features and bug fixes to be merged without testing or fuzzing, which themselves may introduce new vulnerabilities or be poorly documented.

In an attempt to address some of these issues, [Google has been fuzzing the Linux kernel for years](https://github.com/google/syzkaller), foundations such as the [OpenSSF (Open Source Security Foundation)](https://openssf.org/) have been created, and various companies like [Microsoft](https://www.microsoft.com/en-us/security/blog/2020/08/03/microsoft-open-source-security-foundation-founding-member-securing-open-source-software/) have begun paying employees to work full-time on securing the Linux kernel.

### Stable Release vs Rolling Release

So if stable releases do not contain all vulnerability fixes from upstream, but rolling releases contain all vulnerability fixes alongside new unknown vulnerabilities, what is the best approach? It's really a damned if you do and damned if you don't situation, regardless of which option you choose.

Google has an entire blog post about [Linux kernel security done right](https://security.googleblog.com/2021/08/linux-kernel-security-done-right.html) which explains that if you are not using the latest stable kernel, you're leaving yourself vulnerable. Their conclusion is the same as what is mentioned above in the [stable release](#stable-release) section; developers should focus their efforts on upstream contributions to increase overall efficiency of bug fixes, reduce time to patching, and reduce the sheer amount of redundant work being done on each distribution backporting their own fixes.

One solution that is used in Android is [tracking the upstream stable kernel releases, but discarding all the new features](https://security.googleblog.com/2021/08/linux-kernel-security-done-right.html#:~:text=Android%20vendors%20do%20now%2C%20thankfully%2C%20track%20stable%20kernel%20releases.%20So%20even%20though%20the%20features%20being%20added%20to%20newer%20major%20kernels%20will%20be%20missing%2C%20all%20the%20latest%20stable%20kernel%20fixes%20are%20present.). This creates a balance of receiving all the latest vulnerability fixes while also ensuring unnecessary new features and attack surface are not being introduced. Unfortunately, no Linux distributions appear to be taking this approach at the time of writing.

### Duplicated Efforts

At the time of writing, there are 6 LTS kernels and 1 stable kernel according to [kernel.org](https://kernel.org/). However, [kernel.org](https://kernel.org) does not list every Linux kernel that exists.

![](../../../assets/linux/linux_kernels.webp)

Lots of distributions such as Ubuntu maintain their own forks of the Linux kernel with their own [modifications](https://ubuntu.com/blog/ubuntu-23-10-restricted-unprivileged-user-namespaces) [and changes](https://ubuntu.com/blog/whats-new-in-security-for-ubuntu-24-04-lts).

Each distribution compiles the kernel differently and may apply its own patches on top. This leads to situations where multiple Linux distributions may be running the same kernel version, but each kernel enables/disables different features of the kernel, applies its own patches, uses its own security policies, _and_ maintains its own backported security fixes.

This process creates a lot of unnecessary duplicated effort within the Linux community. In an ideal world, all distributions would contribute upstream so that all Linux users would benefit, but unfortunately this is not the case.

### Exploit mitigations

Similarly to how a lot of distributions maintain their own kernel, the same is true for exploit mitigations, it's all over the place. [Fedora](https://fedoraproject.org/) stands out as having arguably the most effective ones, the Project has an entire [Article](https://fedoraproject.org/wiki/Security_Features) about them. [Secureblue](https://github.com/secureblue/secureblue) also mentions that Fedora is one of the few distributions that ships with SELinux tooling built-in and enabled by default.

[Ubuntu](https://ubuntu.com/download) also has a [list](https://wiki.ubuntu.com/Security/Features) of mitigations they apply, however their effectiveness on a stable distribution is questionable for reasons described prior. The package format Ubunutu uses to attempt application sandboxing [has x11 access](https://snapcraft.io/docs/x11-interface) by default, just like [flatpak](https://www.flatpak.org/), the verified remote of which is [used by Secureblue](https://github.com/secureblue/secureblue?tab=readme-ov-file#hardening). However, apps only decide which permissions they get by **default**, if a permission is revoked, it cannot gain access to it, similairly how it works on Android, although Android's implementation, which grants apps permissions directly by the user at runtime is better. Flatpak specifically has issues, as it [breaks browser sandboxing](https://forum.vivaldi.net/topic/33411/flatpak-support/192). 
[Privsec.dev](https://privsec.dev) has an Article on Linux security and mentions the lack of proper application sandboxing, however, similarly to [madaidan's artice](https://madaidans-insecurities.github.io/linux.html#flatpak) it doesn't seem to properly convey that the apps cannot grant permission themselves if the user has denied them. Additionally, many applications couldn't possibly function without access to `fileystem=home` as they are userspace programs and most likely will need to have access to it. It should also be mentioned that many applications exist which do not have filesystem access at all and are entierly self contained. Though as this is dependent on the developer, many apps do not have proper sandboxing at all, especially unofficial flatpak versions, which oftentimes ask for all possible permissions and lack behind on security updates.

[Secureblue](https://github.com/secureblue/secureblue) has a [couple mitigations](https://github.com/secureblue/secureblue?tab=readme-ov-file#hardening) that are unique to it. The project comes with [hardene_malloc](https://github.com/GrapheneOS/hardened_malloc) preinstalled by default for both rpms and flatpaks. The project even goes as far as having it's [hardened-chromium](https://github.com/secureblue/hardened-chromium) subproject, which is inspired by [Vanadium](https://github.com/GrapheneOS/Vanadium) and uses [Fedora's Chromium](https://src.fedoraproject.org/rpms/chromium) as a base. The project only recommends the use of Gnome images, as it is the only DE that prevents apps from accessing screen content at the time of writing. The project constantly tries to remove unnecessary attack surface if possible, this general mentality works very well for exploit mitigations and is what [GrapheneOS](https://grapheneos.org/) describes as the first step defending against unkown vulnerabilities. <sup>[source](https://grapheneos.org/features#exploit-protection)</sup>
The Project also has images without [User namespaces](https://www.man7.org/linux/man-pages/man7/user_namespaces.7.html), which allow unpriveleged users to ineract with parts of the Kernel which are reserved for root, this is cause for many attack vectors using privelege escalation. Disabling this feature breaks funcionality like [Toolbox](https://containertoolbx.org/) and means flatpak can't function without suid set to the bubblewrap binary, therefore bubblewrap creates namespaces instead of the user, in other words it runs as root. As the Project puts it:

> This means trusting bubblewrap (a significantly less battle-tested piece of software than the kernel) to run as root. However, some see this as still a preferable tradeoff (trusting one small program with root in exchange for reducing the kernel's attack surface). Ultimately we leave both options available because it's a tradeoff and neither is demonstrably preferable from a security standpoint. It should also be noted that podman, toolbox, and distrobox require unprivileged user namespaces to function and are therefore [removed in the non-userns images](https://github.com/secureblue/secureblue/blob/live/config/common/disableuserns-packages.yml).
