# KitCoin Final Project

Development should be done on this branch, since it's built to a different docker tag.

Google Classroom: 9n58eb

This is the final repository for ETHS Kitcoin. We are using **NodeJS** and **MongoDB**.

## Responsibilities

- Frontend
  - Keith (leader)
  - Nichol (lead dev)
  - Andrew (dev)
  - Holli
- Backend
  - Oliver (leader, dev)
  - Albert (Google Classroom API lead, dev)
  - Mateo (express lead, dev)
  - Tucker (lead deployment expert, dev)

## How to deploy

1. Edit docker-compose.yml to your satisfaction. Pay close attention to the username, password, and OAuth fields. Ensure that OAUTH_CALLBACK_URL/oauthstage1 is a trusted OAuth redirect URL. (`docker-compose -f whatever up` can be used to run from a file)
2. If you'd like to use an external database, you should comment out the mongodb section of docker-compose.yml and edit the DATABASE_ADDRESS field accordingly.
3. Run `docker-compose up --build -d` to build and run the software. See further documentation on docker-compose [here](https://docs.docker.com/compose/).
4. It's recommended that you use a reverse proxy for Kitcoin, since we don't natively implement HTTPS, and Express's static file serving is a bit slow.

- If you're in a development environment, you can put your files in a directory named 'public' in Kitcoin's working directory and it'll serve them from there.
- If you're in production, you can configure your webserver to pass HTTP(S) requests under OAUTH_CALLBACK_URL and websocket requests on any path you like to Kitcoin, and serve static files for anything else.

5. You can enter Mongo Shell to add administrators by running `docker-compose exec mongodb mongo`.

## How it works

1. User connects. **(app.ts:session)**
2. User sends a first-time sign-in packet. **(google.ts:prepare)** `{"action":"google"}`
3. Server sends back a Google login URL. `{"action":"login","url":"https://foo.bar"}`
   (Also stores the session UUID along with the resolve function)
4. User's app opens the URL.
5. OAuth stage 1 saves the session UUID to window.localStorage, redirects to google **(google.ts:callback)**
6. User chooses their ETHS account and accepts (on Google login page)
7. OAuth stage 2 loads the session UUID and puts it in the URL, moves to stage 3
8. OAuth stage 3's request gets the auth token to the server and closes itself.
9. Server finds the resolve function by the uuid and calls it with the token.
10. Server saves refresh token to database for later use, passes the secret to the client.
11. Server calls Google APIs to check the user's email address **(app.ts:session)**
12. Server queries database to look for the user, creating them if they're not present.
13. Server tells the client it's ready.
14. Client can now make requests.
15. Client disconnects.

---

1. User connects. **(app.ts:session)**
2. User sends a session restore packet. **(google.ts:prepare)** `{"action":"secret","secret":"spooky"}`
3. Server looks up the corresponding refresh token, alerting the client if it doesn't exist.
4. Server tells the client that login was successful.
5. Server calls Google APIs to check the user's email address **(app.ts:session)**
6. Server queries database to look for the user, creating them if they're not present.
7. Server tells the client it's ready.
8. Client can now make requests.
9. Client disconnects.

## TODO

- Check if user has a _staff_ and check if classroom permission has been granted. If not granted, request permission.
