# Security Specification: Weather Intelligence Firestore Rules

This document outlines the security invariants, vulnerability tests, and security architecture of the Weather Intelligence Firebase schema.

## 1. Data Invariants

1. **User Ownership**: A user profile (`/users/{userId}`) can only be created, read, or updated by the authenticated user whose `request.auth.uid` matches the `userId`.
2. **Favorite Ownership**: A favorite coordinate (`/users/{userId}/favorites/{cityId}`) can only be created, read, or modified by the user who owns the parent `/users/{userId}` path.
3. **Immutability of Author**: The user ID field (`userId`) in any favorite coordinate document must be verified against `request.auth.uid` on creation, and is immutable.
4. **Data Types & Sizes**: 
   - City IDs must be integers.
   - City name and other text fields must be string types strictly bounded in length to prevent Denial of Wallet storage attacks.
   - Coordinates (latitude/longitude) must be numeric types (float or integer).

---

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads attempt to breach identity, integrity, and state, and must be rejected by the security rules:

### P1: Identity Spoofing (Create User Profile for Another UID)
```json
// Path: /users/victim-user-123
{
  "uid": "victim-user-123",
  "email": "hacker@evil.com",
  "displayName": "Spoofed User"
}
```
*Expected Result:* `PERMISSION_DENIED` (Hacker is signed in as `attacker-456`).

### P2: Privilege Escalation (Modifying Profile Created Timestamp)
```json
// Path: /users/attacker-456
{
  "uid": "attacker-456",
  "email": "hacker@evil.com",
  "createdAt": "2020-01-01T00:00:00Z" // client-supplied historical timestamp
}
```
*Expected Result:* `PERMISSION_DENIED` (`createdAt` must match server timestamp `request.time`).

### P3: Cross-User Write (Pin Favorite to Victim's Account)
```json
// Path: /users/victim-user-123/favorites/5128581
{
  "id": 5128581,
  "name": "New York",
  "latitude": 40.7128,
  "longitude": -74.006,
  "userId": "victim-user-123"
}
```
*Expected Result:* `PERMISSION_DENIED` (Hacker cannot write to `/users/victim-user-123/*`).

### P4: Identity Spoofing inside Owner Collection (Mismatching userId field)
```json
// Path: /users/attacker-456/favorites/5128581
{
  "id": 5128581,
  "name": "New York",
  "latitude": 40.7128,
  "longitude": -74.006,
  "userId": "victim-user-123" // Spoofed UID inside own collection
}
```
*Expected Result:* `PERMISSION_DENIED` (`userId` field must match path parameter `userId` and `request.auth.uid`).

### P5: Resource Poisoning (Massive City Name string size)
```json
// Path: /users/attacker-456/favorites/5128581
{
  "id": 5128581,
  "name": "New York... [Repeated 10000 times]", // 100KB string
  "latitude": 40.7128,
  "longitude": -74.006,
  "userId": "attacker-456"
}
```
*Expected Result:* `PERMISSION_DENIED` (City name must be `<= 128` characters).

### P6: Type Poisoning (String type instead of numeric coordinates)
```json
// Path: /users/attacker-456/favorites/5128581
{
  "id": 5128581,
  "name": "New York",
  "latitude": "40.7128", // String type injection
  "longitude": -74.006,
  "userId": "attacker-456"
}
```
*Expected Result:* `PERMISSION_DENIED` (latitude must be a float or integer).

### P7: Value Poisoning (String type instead of integer city ID)
```json
// Path: /users/attacker-456/favorites/5128581
{
  "id": "5128581", // String instead of integer ID
  "name": "New York",
  "latitude": 40.7128,
  "longitude": -74.006,
  "userId": "attacker-456"
}
```
*Expected Result:* `PERMISSION_DENIED` (id must be an integer).

### P8: Query Scraping (Attempting to list favorites of another user)
`getDocs(collection(db, 'users/victim-user-123/favorites'))`
*Expected Result:* `PERMISSION_DENIED` (Requires active user ID matching the path).

### P9: Missing Required Fields (Pinning without coordinates)
```json
// Path: /users/attacker-456/favorites/5128581
{
  "id": 5128581,
  "name": "New York",
  "userId": "attacker-456"
  // missing latitude and longitude
}
```
*Expected Result:* `PERMISSION_DENIED`.

### P10: Ghost Field Injection (Attempting to write an unauthorized property)
```json
// Path: /users/attacker-456/favorites/5128581
{
  "id": 5128581,
  "name": "New York",
  "latitude": 40.7128,
  "longitude": -74.006,
  "userId": "attacker-456",
  "isSuperAdmin": true // Unauthorized ghost field
}
```
*Expected Result:* `PERMISSION_DENIED` (Strict key and type validation helper checks).

### P11: Update-Gap Attack (Attempting to modify immutable userId field)
```json
// Path: /users/attacker-456/favorites/5128581
// Existing userId: attacker-456, Attempting to change to: victim-user-123
{
  "id": 5128581,
  "name": "New York New Name",
  "latitude": 40.7128,
  "longitude": -74.006,
  "userId": "victim-user-123"
}
```
*Expected Result:* `PERMISSION_DENIED` (Updates cannot change `userId`).

### P12: Global Read Bypass (Querying all favorites across all users)
`getDocs(collectionGroup(db, 'favorites'))`
*Expected Result:* `PERMISSION_DENIED` (Protected by the default-deny global safety net and collection-level rules).
