# API Calls

## During login

### Login by secret

```json
{
	"action": "secret",
	"secret": "..."
}
```

Pass the secret you've stored as the 'secret' key and you'll receive this message.

```json
{
	"action": "secret",
	"result": "true-or-false"
}
```

If 'result' is true, you're good to go. If it is false, you need to log in with Google instead.

### Login by OAuth

```json
{	"action": "google" }
```

Send this and you'll soon receive a message that looks like this.

```json
{
	"action": "login",
	"url": "..."
}
```

### General login

Once you've logged in with either strategy, you'll receive a message like this one. 

```json
{
	"action": "ready",
	"name": "...",
	"address": "...",
	"balance": "number"
}
```

You can display these values to your users if you like.

## Once you're logged in

### Balance

```json
// Send
{	"action": "balance" }
// Response
{ "action":"balance", "balance":"number" }
```

### Send

```json
// Send
{ "action": "send", "target": "...", "amount": "number" }
// Response
{ "action": "sendResponse", "status": "ok|badInput|nonexistentTarget|insufficientBalance" }
```

### Take

Requires vendor, teacher, or admin.

Warning: This can cause an account to have a negative balance.

```json
// Send
{ "action": "take", "target": "...", "amount": "number" }
// Response
{ "action": "take", "status": "ok|denied|nonexistentTarget" }
```

### Mint

Requires teacher or admin.

```json
// Send
{ "action": "mint", "amount": "number" }
// Response
{ "action": "mintResponse", "status": "ok|badInput|denied" }
```

### Void

Requires teacher or admin.

```json
// Send
{ "action": "void", "amount": "number" }
// Response
{ "action": "voidResponse", "status": "ok|badInput|denied" }
```

### Secret

```json
// Send
{ "action": "secret" }
// Response
{ "action": "secret", "secret": "..." }
```