---
title: ChromeOS
description: A detailed look at the security of ChromeOS
---

ChromeOS is the most secure consumer OS currently on the market. It employs an extremely extensive defence-in-depth security model. 

## Update Cycle

ChromeOS follows the weekly Chrome release cycle.<sup>[1](https://security.googleblog.com/2023/08/an-update-on-chrome-security-updates.html)</sup> This can be verified by checking the [Chrome updates page](https://chromereleases.googleblog.com/search/label/Stable%20updates) which shows ChromeOS getting weekly stable updates.

## Android Runtime on ChromeOS (ARCVM)

ChromeOS has undergone significant advancements in running Android apps through three iterations of Android Runtime for ChromeOS (ARC)<sup>[2](https://chromeos.dev/en/posts/making-android-runtime-on-chromeos-more-secure-and-easier-to-upgrade-with-arcvm#what-is-arc)</sup>:

- ARC (2014): The initial version relied on Native Client ([NaCl](https://developer.chrome.com/docs/native-client/)), requiring app recompilation and limiting users to a curated selection by Google.

- ARC++ (2016): This iteration introduced containerization using Linux Kernel features like [cgroups](https://en.wikipedia.org/wiki/Cgroups) and [namespaces](https://en.wikipedia.org/wiki/Linux_namespaces). This allowed unmodified Android apps to run in an isolated environment and opened the door for the Google Play Store on Chromebooks.

- ARCVM (2021): The latest and most advanced version leverages virtual machines (VMs) to completely isolate Android apps from the underlying ChromeOS by utilizing [crosvm](#crosvm).

The image below showcases the architectural differences between ARC++ and ARCVM.

![](../../../assets/arcvm.png)

ARCVM achieves a clean separation between ChromeOS and Android by running Android within a virtual machine (VM). This isolation reduces dependencies and simplifies updates for each system. Let’s look at the ARCVM kernel as an example.

### ARCVM Kernel

> The ARCVM kernel is a single, unified kernel (available for both x86_64 and aarch64 architectures) that comes bundled with ARCVM. It's a customized version of the Android Common Kernel (ACK) with specific patches to ensure smooth integration with the host OS (ChromeOS in this case). An example of such a patch is Virtio support for Wayland, which facilitates graphics communication.
> 
> [source](https://chromeos.dev/en/posts/making-android-runtime-on-chromeos-more-secure-and-easier-to-upgrade-with-arcvm#simplicity-means-upgradability)

While Google doesn't publicly disclose the specific hardening measures implemented in the ARCVM kernel, the open-source nature of ChromiumOS, the foundation for ChromeOS, provides valuable insight. By examining the [ChromiumOS ARCVM git repos](https://chromium.googlesource.com/chromiumos/third_party/kernel/+/refs/heads/chromeos-5.10-arcvm), we can identify the security features incorporated into the kernel.

These features will be documented to the best of our ability in the future.

### Venus

Venus is an efficient framework for virtualized vulkan. Refer to [Venus](#venus-1) for more information.

### Future ARCVM Work

> Using KVM-based VMs on battery-powered devices like Chromebook is not common and still has some unexplored areas that we can improve.
>
> For example, memory usage optimization is critical since our devices have far less RAM than traditional KVM deployments on massive servers. Applying [multi-generational LRU](https://www.phoronix.com/scan.php?page=news_item&px=Linux-Multigen-LRU) (MGLRU) was a huge win for our memory usage.
>
> Additionally, we have an experimental project called [ManaTEE](https://www.youtube.com/watch?v=BD_lcnkNAk4&t=508s) which pushes VM usage forward and provides software-based Trusted Execution Environments (TEEs) without dedicated TEE hardware. This opens up an opportunity for us to store data which should not be exposed even to the host OS, such as biometrics and encryption keys.
>
> [Source](https://chromeos.dev/en/posts/making-android-runtime-on-chromeos-more-secure-and-easier-to-upgrade-with-arcvm#future-work)

Manatee is under active development by Google, but as of June 23, 2024 it is not yet used in production. For those interested, take a look at the [ChromiumOS ManaTEE git repo](https://chromium.googlesource.com/chromiumos/third_party/kernel/+/refs/heads/chromeos-5.10-manatee) and the [BlinkOn conference presentation](https://www.youtube.com/watch?v=BD_lcnkNAk4&t=508s) YouTube video which explains what ManaTEE is and how it works.

## Linux Dev Environment (Crostini)

The majority of security features for Crostini are used for ARCVM as well. See [CrosVM](#crosvm) for detailed documentation.

### Chunnel

> chunnel tunnels traffic for servers that listen on localhost. This is a common developer use case since localhost is allowed as a secure origin in Chrome.
> 
> The chunneld binary runs on the Chrome OS host, and receives updates from vm_cicerone notifying it of ports that should be listened to. When Chrome connects to localhost:port, chunneld will accept the connection, open a vsock listener, and launch the chunnel binary in the target container which will connect back to chunneld.
> 
> [source](https://chromium.googlesource.com/chromiumos/platform2/+/HEAD/vm_tools/#chunnel)

### Virtio-Wayland

Uses a custom virtio-based protocol. The device implementation is in CrosVM while the driver implementation is in the guest kernel. CrosVM makes host-side wayland connections, buffers, and pipes on behalf of the guest kernel.

There is also a user-space component called [Sommelier](#sommelier).

### Sommelier

Implementing X11 over wayland usually means the compositor gives X11 applications extra privileges which ordinary wayland applications don't have. Sommelier doesn't grant applications those privileges, but rather tricks them into thinking they have them. This is to keep good security while being very useful.

### LXD

Run by [Maitred](#maitred). Responsible for downloading, creating and running containers. While the default is a Crostini-flavoured Debian, any Linux distribution that LXC supports can be used (Arch, Gentoo, Kali, etc.).

### Termina

Read-only, dm-verity verified. Downloaded, updated and verified by component updater. Termina is the ChromeOS "baseboard", tatl for x86, tael for ARM.

### Tremplin

> Tremplin is the “springboard” daemon that runs in the Termina VM and exposes a gRPC interface for managing LXD containers.
>
> [source](https://chromium.googlesource.com/chromiumos/platform/tremplin/+/master/)

### Limitations

- No "super" apps - screen locks, screen capture, accessibility tools
- No raw access to hardware devices
- No data link layer access (i.e. layer 2 network access)
- No KVM access
- No access to Chrome data (history, cookies, Google account)
- No sound, USB peripherals, GPU access, IPv6

### Notificationd

> notificationd is a new daemon which catches the notification request from Crostini apps via D-BUS and forwards it to Chrome OS (host) via Wayland.
>
> [source](https://chromium.googlesource.com/chromiumos/platform2/+/HEAD/vm_tools/notificationd/)

### Upgrade Container

> upgrade_container is executed inside a container by [Tremplin](#tremplin) to upgrade the container e.g. a Debian Stretch container to Debian Buster.
> 
> [source](https://chromium.googlesource.com/chromiumos/platform2/+/HEAD/vm_tools/#upgrade_container)

## Core Scheduling

Recent CPU vulnerabilities, particularly those targeting hyperthreading, have highlighted security risks. The discovery of [Microarchitectural Data Sampling (MDS) attacks](https://mdsattacks.com/), like [Rogue In-Flight Data Load (RIDL)](https://mdsattacks.com/files/ridl.pdf) and [fallout](https://mdsattacks.com/files/fallout.pdf), allows malicious actors to exploit weaknesses within a CPU core. These attacks enable one hyperthread to glean sensitive data from another by analyzing side-channel information. While disabling hyperthreading is a typical defense against such vulnerabilities, it often comes at the expense of processing speed.<sup>[3](https://chromeos.dev/en/posts/improving-chromeos-performance-with-core-scheduling)</sup> Google's bug hunters blog has an [excellent writeup on MDS attacks](https://bughunters.google.com/blog/4712170091839488/no-more-speculation-exploiting-cpu-side-channels-for-real) for those that want to learn more about MDS vulnerabilities.

While a brute-force approach of disabling the vulnerable functionality might appear effective for mitigating CPU vulnerabilities, it often incurs a substantial performance penalty.

### ChromeOS Core Scheduling Implementation

Core scheduling in ChromeOS relies on collaboration between user space and the kernel to ensure security and performance. User space defines groups of tasks that are considered trustworthy towards each other. The kernel scheduler then restricts tasks within the same group to share a CPU core's hyperthreads simultaneously. This balancing act optimizes performance by ensuring tasks run efficiently while maintaining fairness. The scheduler dynamically switches between two modes:

- 1-runqueue mode: Both hyperthreads act as a single unit, ensuring the highest priority task executes.


- 2-runqueue mode: Each hyperthread has its own runqueue, allowing tasks to run independently.

The chosen mode depends on the task priorities and compatibility within the group.<sup>[4](https://chromeos.dev/en/posts/improving-chromeos-performance-with-core-scheduling#core-scheduling-in-chromeos:~:text=In%20order%20to,with%20each%20other.)</sup>

There are three primary users of core scheduling in ChromeOS:<sup>[5](https://chromeos.dev/en/posts/improving-chromeos-performance-with-core-scheduling#core-scheduling-in-chromeos:~:text=In%20ChromeOS%20there,parent%20and%20siblings.)</sup>

- Chrome Browser: When a renderer process is created, Chrome assigns a unique group before entering the sandbox. This design grants ChromeOS the necessary privilege to assign the group but prevents modifications once secure isolation is established.


- Virtual Machines (VMs): Each VM receives a unique group for all its virtual CPU threads. This isolation protects the ChromeOS host from malicious VMs and vice versa, additionally preventing VMs from interfering with each other.


- Android Containers: On some devices, Android containers are utilized. The initial process within the container gets assigned a unique group, isolating both the container and its processes from the ChromeOS host and vice versa. Furthermore, a "tag-on-fork" mechanism guarantees new processes within the container remain isolated from their parent and siblings.

### Addressing Kernel Space Concerns

A theoretical concern exists regarding user space "trusted" processes potentially compromising security. This is because a hyperthread can enter the kernel while its sibling remains in user space. To address this, ChromeOS employs per-CPU counters to monitor a core-wide "unsafe state." This state activates whenever a core's hyperthread transitions to kernel mode. When in this unsafe state, ChromeOS utilizes Inter-processor interrupts (IPI) to temporarily remove all hyperthreads from user space, excluding those already idle. Google's testing demonstrates this mechanism has minimal performance impact.<sup>[6](https://chromeos.dev/en/posts/improving-chromeos-performance-with-core-scheduling#core-scheduling-in-chromeos:~:text=There%20is%20still,showing%20an%20example%3A)</sup>

The image below shows what this looks like:

![](../../../assets/hyperthread-ipi.png)

## Crosvm

ChromeOS utilizes crosvm, a lightweight virtual machine monitor (VMM), to securely run both Linux applications and Android environments. Prioritizing security, crosvm isolates these untrusted environments within sandboxes. Written in Rust, a memory-safe language, crosvm minimizes the risk of vulnerabilities. Each virtual device, like disks and network interfaces, runs within its own minijail sandbox, further restricting potential exploits. This multi-layered approach ensures that even a compromised Linux instance or Android container cannot escape the sandbox and harm the core ChromeOS system. Crosvm strengthens this security by enforcing a syscall security policy, meticulously controlling which system calls guest Linux devices and Android containers can execute.<sup>[7](https://crosvm.dev/book/introduction.html)</sup>

![](../../../assets/cros-vms.png)
Image from [Zack Reizner's BlinkOn conference presentation](https://youtu.be/BD_lcnkNAk4?feature=shared&t=925)

### Cicerone

> vm_cicerone is a system daemon that runs in Chrome OS userspace and is responsible for all communication directly with the container in a VM. It exposes a [D-Bus API](https://chromium.googlesource.com/chromiumos/platform/system_api/+/HEAD/dbus/vm_cicerone) for doing things such as launching applications in containers, getting icons from containers and other container related functionality as it is extended. It also sends out signals for starting/stopping of containers.
>
> [Concierge](#concierge) communicates with vm_cicerone to keep the list of running VMs in sync and also to retrieve status of containers and get security tokens.
>
> When cicerone communicates with a container, it is interacting with the garcon component running inside of that container and is doing so over gRPC.
>
> [source](https://chromium.googlesource.com/chromiumos/platform2/+/HEAD/vm_tools/README.md#vm_cicerone)

### Concierge

> vm_concierge is a system daemon that runs in Chrome OS userspace and is responsible for managing the lifetime of all VMs. It exposes a [D-Bus API](https://chromium.googlesource.com/chromiumos/platform/system_api/+/HEAD/dbus/vm_concierge/) for starting and stopping VMs.
> 
> When vm_concierge receives a request to start a VM it allocates various resources for that VM (IPv4 address, vsock context id, etc) from a shared pool of resources. It then launches a new instance of [crosvm](#crosvm) to actually run the VM.
> 
> Once the VM has started up vm_concierge communicates with the maitred instance inside the VM to finish setting it up. This includes configuring the network and mounting disk images.
> 
> [source](https://chromium.googlesource.com/chromiumos/platform2/+/HEAD/vm_tools/README.md#vm_concierge)
 
### Garcon

> Garcon is a daemon that runs inside of a container within a VM. gRPC is used to communicate between vm_cicerone and garcon. It is used to control/query things inside the container such as application launching, accessibility, handling intents, opening files, etc. The communication is bi-directional. It uses TCP/IP for the transport and firewall rules ensure that only the container IPs are allowed to connect to the corresponding port for garcon that is open in [vm_cicerone](#cicerone).
>
> [source](https://chromium.googlesource.com/chromiumos/platform2/+/HEAD/vm_tools/README.md#garcon)

### Maitred

> Maitred is the agent running inside the VM responsible for managing the VM instance. It acts as the init system, starting up system services, mounting file systems, and launching the container with the actual application that the user wants to run. It is responsible for shutting down the VM once the user's application exits or if requested to by vm_concierge.
> 
> [source](https://chromium.googlesource.com/chromiumos/platform2/+/HEAD/vm_tools/README.md#maitred)

### Seneschal

> seneschal is the steward of the user's /home directory. It manages processes that serve the [9p file system protocol](https://man.cat-v.org/plan_9/5/0intro). The 9p client lives in the guest kernel and communicates with the server over [vsock](https://lwn.net/Articles/695981/).
> 
> Each server initially does not have access to any path but can be granted access to specific paths in the user‘s home directory by sending requests over dbus to seneschal. These paths are bind-mounted into the server’s root directory and become visible to the 9p clients of that server.
> 
> This makes it possible to share different sets of paths with different VMs by giving each of them access to a different 9p server.
> 
> [source](https://chromium.googlesource.com/chromiumos/platform2/+/HEAD/vm_tools/#seneschal)

### 9s

> 9s is program that serves the [9p file system protocol](https://man.cat-v.org/plan_9/5/0intro). [seneschal](#seneschal) launches one instance of this program for each VM started by the user. It is a small wrapper around the p9 rust library.

## Minijail

Minijail is used extensively within ChromeOS to heavily sandbox and isolate processes. It utilizes namespace isolation, seccomp filtering, 

[ChromeOS permission broker](https://chromium.googlesource.com/chromiumos/platform2/+/HEAD/permission_broker)

## SELinux

A lot of SELinux policies are imported from AOSP.

[SELinux ChromeOS policies](https://chromium.googlesource.com/chromiumos/platform2/+/HEAD/sepolicy/)

## Venus

> Venus is an efficient framework for virtualized Vulkan, providing the accelerated Vulkan API to ChromeOS guest VM applications. Venus has a lightweight guest-side implementation that streams Vulkan API calls into a shared memory buffer that the host-side renderer asynchronously consumes. Its predecessor, VirGL, in contrast has a guest-side driver that interprets OpenGL calls to synchronously return OpenGL state and error results at the expense of additional CPU overhead.This causes a performance hit twice, once when the renderer interprets and submits those commands to the host, and again for error checking and state tracking, as required by [the spec](https://www.khronos.org/registry/OpenGL/index_es.php).
>
> One of the big design changes from VirGL is Venus’s process isolation. In the event of an attack on the host through the guest graphics API, the Venus architecture limits the attack to the guest application’s own graphics data as opposed to the guest OS’s system memory.
>
> [source](https://chromeos.dev/en/posts/improving-vulkan-availability-with-venus)

Venus is used for the graphics API in borealis and [ARCVM](#android-runtime-on-chromeos-arcvm).

![](../../../assets/venus.png)

