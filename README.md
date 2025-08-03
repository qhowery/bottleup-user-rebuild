# BottleUp User App — Clean Rebuild

This project is a ground-up rebuild of the BottleUp `user-app` using an updated React Native and Node environment. It addresses architecture issues from the legacy app and implements all critical user-side and admin flows.

Author: Quon Lee  
Start Date: July 6, 2025

## Environment Variables

Create a `.env` file by copying the provided `.env.example` and fill in your project credentials.

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
STRIPE_PUBLIC_KEY_NATIVE=
STRIPE_PUBLIC_KEY_WEB=
```

These variables are required at build time for Supabase and Stripe to function correctly.
