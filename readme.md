# KitCoin server

## How to deploy

    docker-compose up --build -d

## How it works

1. User connects. __(app.ts:session)__
2. User sends a first-time sign-in packet. __(google.ts:prepare)__ `{"action":"google"}`
3. Server sends back a Google login URL. `{"action":"login","url":"https://foo.bar"}`
(Also stores the session UUID along with the resolve function)
4. User's app opens the URL.
5. OAuth stage 1 saves the session UUID to window.localStorage, redirects to google __(google.ts:callback)__
6. User chooses their ETHS account and accepts (on Google login page)
7. OAuth stage 2 loads the session UUID and puts it in the URL, moves to stage 3
8. OAuth stage 3's request gets the auth token to the server and closes itself.
9. Server finds the resolve function by the uuid and calls it with the token.
10. Server saves refresh token to database for later use, passes the secret to the client.
11. Server calls Google APIs to check the user's email address __(app.ts:session)__
12. Server queries database to look for the user, creating them if they're not present.
13. Server tells the client it's ready.
14. Client can now make requests.
15. Client disconnects.

---

1. User connects. __(app.ts:session)__
2. User sends a session restore packet. __(google.ts:prepare)__ `{"action":"secret","secret":"spooky"}`
3. Server looks up the corresponding refresh token, alerting the client if it doesn't exist.
4. Server tells the client that login was successful.
5. Server calls Google APIs to check the user's email address __(app.ts:session)__
6. Server queries database to look for the user, creating them if they're not present.
7. Server tells the client it's ready.
8. Client can now make requests.
9. Client disconnects.

## TODO

- Check if user has a _staff_ and check if classroom permission has been granted. If not granted, request permission.
