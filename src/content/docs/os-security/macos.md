---
title: MacOS
description: A detailed look at the security of MacOS
---

Due to MacOS being rather closed down, the information provided is dependent on information Apple has published and findings from security researchers.

🚧 These docs are still under active development 🚧

🚧The sources listed should be converted to an extensive documentation resource by August 17th, 2024 🚧

## BlastDoor

Sources for this section:

https://support.apple.com/en-eg/guide/security/secd3c881cee/1/web/1

## Direct Memory Access

Sources for this section:

https://support.apple.com/en-eg/guide/security/seca4960c2b5/1/web/1

## FileVault

Sources for this section:

https://support.apple.com/en-ca/guide/mac-help/mh11785/mac

## Gatekeeper

Sources for this section:

https://support.apple.com/en-eg/guide/security/sec5599b66df/1/web/1

## Lockdown Mode

Sources for this section:

https://support.apple.com/en-eg/guide/security/sec2437264f0/1/web/1

https://support.apple.com/en-us/105120

https://munkschool.utoronto.ca/news/ron-deibert-and-citizen-lab-apple-lockdown-mode

https://techcrunch.com/2023/04/18/apple-lockdown-mode-iphone-nso-pegasus/

## Secure Boot

Sources for this section:

https://support.apple.com/en-eg/guide/security/secac71d5623/1/web/1

https://support.apple.com/en-eg/guide/security/sec7d92dc49f/1/web/1

## System Integrity Protection (SIP)

Sources for this section:

https://support.apple.com/en-eg/guide/security/secb7ea06b49/1/web/1

## Sandboxing


## XNU (MacOS Kernel)

Like most kernels in production today, XNU is built using C and C++; two languages known for being unsafe. Unfortunately, due to how large and complex kernels can be, it is not trivial to rewrite kernels in a safer language. 

As a compromise, many companies have instead begun opting for hardened memory allocators and type isolation. While it isn't a perfect solution, it does substantially improve the security of kernels and is a good first step to take while safer languages are being adopted.

### kalloc_type

`Kalloc_type` is a hardened memory allocator developed by Apple which was first [released with iOS 15](https://security.apple.com/blog/towards-the-next-generation-of-xnu-memory-safety/#:~:text=We%20first%20shipped%20this%20new%20hardened%20allocator%2C%20called%20kalloc_type%2C%20in%20iOS%2015%2C%20and%20this%20year%20we%E2%80%99ve%20expanded%20its%20use%20across%20our%20systems.) with the primary goal of providing a means of type isolation in the existing kernel code. It has since been rolled out to every OS that Apple develops.

Within the context of XNU, type confusion was utilized in [almost all attacks](https://googleprojectzero.blogspot.com/2020/06/a-survey-of-recent-ios-kernel-exploits.html) to ultimately achieve arbitrary code execution. `Kalloc_type` was developed due the lack of specialized hardware assistance such as ARM's memory tagging extensions (MTE). The next best mitigation strategy for temporal memory issues was type isolation and sequestering.

## XProtect

Sources for this section:

https://support.apple.com/en-eg/guide/security/sec469d47bd8/1/web/1

https://www.sentinelone.com/blog/mac-admins-why-apples-silent-approach-to-endpoint-security-should-be-a-wake-up-call/