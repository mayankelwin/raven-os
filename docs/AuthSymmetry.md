# Auth Symmetry: Secure E2EE Identity

The **Auth Symmetry** engine provides a unified authentication experience that is fully integrated into the Nexus Hub.

## 🛡️ Identity Engine (useRavenAuth)

For managing user registration, login, and sessions across all devices:

```tsx
const { signUp, signIn, signOut, state } = useRavenAuth();

// Sign up (password is E2EE hashed locally)
signUp('mayankelwin@raven-os.dev', 'password123');

// Access current user
if (state.isAuthenticated) {
  console.log(`Welcome, ${state.user.email}`);
}
```

## 🔒 Security Architecture (RavenCrypt)

- **End-to-End Encryption (E2EE)**: Sensitive data is hashed using **AES-GCM 256-bit** on the client (Web or Mobile) before being sent to the Hub.
- **Session Persistence**: Sessions are synchronized via the Nexus protocol and persisted in the local browser or mobile storage.
- **Identity Privacy**: Only authorized clients within the same "Nexus Room" can authenticate with their corresponding keys.

## 💎 Pro Components (AuthGuard)

You can protect any screen by wrapping it with a single component:

```tsx
<AuthGuard>
  <Dashboard />
</AuthGuard>
```

This will automatically render a premium login/registration form if the user is not authenticated.
