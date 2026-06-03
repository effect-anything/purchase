# Purchase

`@effect-x/purchase` is a provider-neutral payment SDK for Effect applications. It is being built for small studios and product teams that run multiple apps and want one shared commercial runtime instead of re-implementing Stripe and Paddle details in every project.

The target product shape is:

- one catalog DSL for subscriptions, one-time purchases, and credits
- one workflow runtime for checkout, webhooks, entitlements, refunds, and portals
- multiple provider backends behind the same API
- embeddable storage and schema integration for app-owned databases
