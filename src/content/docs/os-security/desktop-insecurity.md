# Desktop OS (in)security

Desktop OSs are very lacking compared to Mobile OSs. There are several Articles proving this. 

### Articles on Linux

- [Article by madaidan](https://madaidans-insecurities.github.io/linux.html)

- [Article on Privsec.dev](https://privsec.dev/posts/linux/linux-insecurities/)

- [Linux Security](https://netrunner.academy/os-security/linux/)

## [Windows](https://netrunner.academy/os-security/windows/)
Windows is better in some aspects, but it's not great either. Most users install apps by downloading exe files from the Internet, without any execution restrictions. 
Microsoft has attempted to fix this issue by introducing it's store, S-mode, Smart App Control and Applocker. 
All of them being problematic due to developers not signing their apps properly and thus making the features useless.

## [macOS](https://netrunner.academy/os-security/macos/)
Macos is a lot better, but still leaves a lot to the user, [Lockdown mode](https://support.apple.com/guide/security/lockdown-mode-security-sec2437264f0/web)
is a good feature, but not enabled by default. It has a proper SecureBoot implementation, and several GrapheneOS community members recommend it.

> Which company hardware, approach do you favor?

> For laptops: Apple (with the assumption that you will stick to macOS on their devices)

###### -- TommyTran732, [Privsec.dev](https://privsec.dev) admin and moderator in the GrapheneOS channels, commented on the [qubes-os forum](https://forum.qubes-os.org/t/discussion-on-purism/2627/70)

## [Secureblue](https://github.com/secureblue/secureblue)
Secureblue is a project that attempts to apply hardening to atomic images of fedora by setting hardened kargs, disabling features, 
installing [hardened_malloc](https://github.com/GrapheneOS/hardened_malloc) and much more by default. There is a [list](https://github.com/secureblue/secureblue?tab=readme-ov-file#hardening)
of hardening applied on the project's readme. [Hardened-Chromium](https://github.com/secureblue/hardened-chromium) is a sub-project of it. 
The fundamental flaws described in madaidan's article remain the same however. Only Gnome images are recommended, but the project offers many more, including server images.

## [ChromeOS](https://netrunner.academy/os-security/chromeos/)
ChromeOS is regarded as the most secure desktop os by many and follows the ideology of good defaults, just like Secureblue. It can easily be adapted to many workflows using VMs.

## [GrapheneOS](https://grapheneos.org)
GrapheneOS isn't a Desktop OS, it's an OS built from the base of the [Android Open Source Project (AOSP)](https://source.android.com/) and is arguably the most secure OS there is.

