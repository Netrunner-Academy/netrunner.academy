---
title: Windows Security
description: A detailed look at the security systems Windows uses
---

## Exploit Mitigations

Exploit mitigations eliminate entire classes of common vulnerabilities and exploit techniques to prevent or severely hinder exploitation. Windows has lots of mitigations built into the OS, which we will explore in more detail below.

Before we start discussing the details of the Windows exploit mitigations, it's important to emphasize why these mitigations are important. According to industry research, anywhere from 60-90% of vulnerabilities are caused by memory safety issues, depending on the product.<sup>[1](https://www.memorysafety.org/docs/memory-safety/#how-common-are-memory-safety-vulnerabilities)</sup> Based on Microsoft's own research, around 70% of the vulnerabilities on Windows are related to memory safety issues.<sup>[2](https://msrc.microsoft.com/blog/2019/07/we-need-a-safer-systems-programming-language/)</sup> Almost all the Windows exploit mitigations revolve around trying to prevent memory safety related security issues.

Windows implements:
- Control Flow Guard
- Data Execution Prevention
- Mandatory ASLR
- Bottom-up ASLR
- High Entropy ASLR
- SEHOP
- Heap Integrity Validation

Let's dive into each of these and what it means for Windows security.

### Control Flow Guard (CFG)

> Control Flow Guard (CFG) is a highly-optimized platform security feature that was created to combat memory corruption vulnerabilities. By placing tight restrictions on where an application can execute code from, it makes it much harder for exploits to execute arbitrary code through vulnerabilities such as buffer overflows. CFG extends previous exploit mitigation technologies such as [/GS](https://learn.microsoft.com/en-us/cpp/build/reference/gs-buffer-security-check?view=msvc-170), [DEP](#data-execution-prevention), and [ASLR](#address-space-layout-randomization-aslr).
>
> - Prevent memory corruption and ransomware attacks.
> - Restrict the capabilities of the server to whatever is needed at a particular point in time to reduce attack surface.
> - Make it harder to exploit arbitrary code through vulnerabilities such as buffer overflows.
>
> [source](https://learn.microsoft.com/en-us/windows/win32/secbp/control-flow-guard#how-does-cfg-really-work)

### Data Execution Prevention

> Data Execution Prevention (DEP) is a technology built into Windows that helps protect you from executable code launching from places it's not supposed to. DEP does that by marking some areas of your PC's memory as being for data only, no executable code or apps will be allowed to run from those areas of memory.
>
> This is designed to make it harder for attacks that try to use buffer overflows, or other techniques, to run their malware from those parts of memory that normally only contain data.
>
> [source](https://support.microsoft.com/en-us/topic/what-is-data-execution-prevention-dep-60dabc2b-90db-45fc-9b18-512419135817)

### Address Space Layout Randomization (ASLR)

> Address space layout randomization (ASLR) is a computer security technique involved in preventing exploitation of memory corruption vulnerabilities. In order to prevent an attacker from reliably redirecting code execution to, for example, a particular exploited function in memory, ASLR randomly arranges the address space positions of key data areas of a process, including the base of the executable and the positions of the stack, heap and libraries.
>
> [source](https://en.wikipedia.org/wiki/Address_space_layout_randomization)

Windows has three ASLR settings in the OS:

| ASLR Settings     | Default Setting |
|-------------------|-----------------|
| Mandatory ASLR    | Off             |
| Bottom-up ASLR    | On              |
| High-Entropy ASLR | On              |

Let's take a look at each of them on their own.

### Mandatory ASLR

By default, Windows only enables ASLR for executables and DLLs which opt-in by linking with the `/DYNAMICBASE` flag. This flag has been enabled by default since Visual Studio 2010, but it's still possible for applications to opt out to avoid non-trivial compatibility issues with existing applications.<sup>[3](https://msrc.microsoft.com/blog/2017/11/clarifying-the-behavior-of-mandatory-aslr/)</sup>


Mandatory ASLR forcibly rebases all executables and DLLs that have not opted in. This can be forced on a per-application basis or system-wide.

Microsoft disables this by default within Windows to prevent compatibility issues with executable files.


### Bottom-up ASLR

Bottom-up ASLR employs randomization during memory allocation, making the base addresses for the heap, stack, and other program segments unpredictable. This thwarts attackers exploiting vulnerabilities that depend on predetermined memory locations.<sup>[4](https://msrc.microsoft.com/blog/2017/11/clarifying-the-behavior-of-mandatory-aslr/)</sup>

Bottom-up ASLR requires an application to be linked with the `/DYNAMICBASE` flag. Bottom-up ASLR will apply to all executables if [Mandatory ASLR](#mandatory-aslr) is enabled.

The image below helps visualize how and when ASLR applies to applications.

![](../../../assets/aslr.png)


### High Entropy ASLR

The `/HIGHENTROPYVA` compiler flag specifies support for high-entropy 64-bit ASLR. This means that the executable image can utilize a larger address space for randomization, leading to higher entropy. However, it's important to note that if an application saves pointers in 32-bit variables, using high entropy could potentially truncate the 64-bit address, leading to application crashes. This issue is more likely with older programs that are not linked with the `/dynamicbase` linker option.<sup>[5](https://learn.microsoft.com/en-us/cpp/build/reference/highentropyva?view=msvc-170)</sup>

Let's take a look at why this matters.

> Prior to Windows 8, 64-bit executable images received the same amount of entropy that was used when randomizing 32-bit executable images (8 bits, or 1 in 256 chance of guessing correctly). The amount of entropy applied to 64-bit images has been significantly increased in most cases starting with Windows 8:
> 
> DLL images based above 4 GB: 19 bits of entropy (1 in 524,288 chance of guessing correctly)
> DLL images based below 4 GB: 14 bits of entropy (1 in 16,384 chance of guessing correctly).
> EXE images based above 4 GB: 17 bits of entropy (1 in 131,072 chance of guessing correctly).
> EXE images based below 4 GB: 8 bits of entropy (1 in 256 chance of guessing correctly).
> 
> [source](https://msrc.microsoft.com/blog/2013/12/software-defense-mitigating-common-exploitation-techniques/)

As we can see based on the information Microsoft provides us, if we do not utilize high entropy ASLR an attacker could have a 1 in 256 chance of guessing the memory address correctly which would open the door for exploitation. High entropy ASLR substantially reduces the likelihood of an attacker guessing the correct memory address. 

High Entropy ASLR applies to all executables that are protected with Bottom-Up ASLR, either by the executable opting in to the `/dynamicbase` linker option or by the user enabling [Mandatory ASLR](#mandatory-aslr).

### Structured Exception Handling Overwrite Protection (SEHOP)

> Structured Exception Handling Overwrite Protection (SEHOP) helps prevent attackers from being able to use malicious code to exploit the Structured Exception Handling (SEH), which is integral to the system and allows (non-malicious) apps to handle exceptions appropriately. Because this protection mechanism is provided at run-time, it helps to protect applications regardless of whether they've been compiled with the latest improvements.
> 
> [source](https://learn.microsoft.com/en-us/windows/security/threat-protection/overview-of-threat-mitigations-in-windows-10#structured-exception-handling-overwrite-protection)

### Validate Heap Integrity

Validate heap integrity is a rather simple exploit mitigation. If heap corruption is detected in any application, it is automatically terminated. This applies to all applications, including system-level application.