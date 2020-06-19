# KitCoin Final Project

Google Classroom: 9n58eb

This is the final repository for ETHS Kitcoin. We are using **NodeJS** and **MongoDB**.

## Guidelines

Check [our contribution guidelines](./CONTRIBUTING.md) before contributing.

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

(Although Kitcoin can be run on bare metal or packaged as a binary and we include the tools to do so, these environments are not supported.)

1. Kitcoin's primary target environment is Docker, so please make sure you have either Docker or Moby Engine installed, along with docker-compose.
   * Moby Engine has a different name, but it provides the same binaries as Docker with the same names and works with everything Docker works with.
   * Run `docker run -d hello-world` to make sure it works.
2. Edit `docker-compose.yml`'s `env` sections to your satisfaction.
3. Run `docker-compose up --build -d` to start the Kitcoin stack.
4. There's currently no way to add the first administrator, so you'll need to edit the database yourself.


## How to develop

1. Ensure you have a Docker/Moby and docker-compose installed.
2. Use Visual Studio Code and install the development container extension.
3. Create an `oauth.env` file and populate it with your Google OAuth information.
3. When opening your local branch, VSCode should prompt you to open a development container, from which you should be able to do everything you need to do.

<!-- 1. Edit docker-compose.yml to your satisfaction. Pay close attention to the username, password, and OAuth fields. Ensure that OAUTH_CALLBACK_URL/oauthstage1 is a trusted OAuth redirect URL. (`docker-compose -f whatever up` can be used to run from a file)
1. If you'd like to use an external database, you should comment out the mongodb section of docker-compose.yml and edit the DATABASE_ADDRESS field accordingly.
2. Run `docker-compose up --build -d` to build and run the software. See further documentation on docker-compose [here](https://docs.docker.com/compose/).
3. It's recommended that you use a reverse proxy for Kitcoin, since we don't natively implement HTTPS, and Express's static file serving is a bit slow.

- If you're in a development environment, you can put your files in a directory named 'public' in Kitcoin's working directory and it'll serve them from there.
- If you're in production, you can configure your webserver to pass HTTP(S) requests under OAUTH_CALLBACK_URL and websocket requests on any path you like to Kitcoin, and serve static files for anything else.

5. You can enter Mongo Shell to add administrators by running `docker-compose exec mongodb mongo`. -->

## How to configure

The following are environment variables that affect Kitcoin's behaviour. Required variables are in bold.

- **DATABASE_ADDRESS**: The location of the MongoDB instance.
- DATABASE_NAME: The name of the database. Defaults to 'kitcoin'.
- DATABASE_USER: The username used to log in to the database. Defaults to no authentication.
- DATABASE_PASSWORD: The password used to log in to the database.
- DATABASE_PORT: The port used to connect to the database. Defaults to 33060.
- WAIT_TO_CONNECT: Some number of seconds to wait before connecting to the database. Defaults to 0.
- **OAUTH_CALLBACK_URL**: Some URL that is routed to the server's `/oauth`.
- ENABLE_REMOTE: When set to 1, enables the admin API calls for privileged users.

## How it works

1. User connects. **(app.ts:session)**
2. User sends a first-time sign-in packet. **(google.ts:prepare)** `{"action":"google"}`
3. Server sends back a Google login URL. `{"action":"login","url":"https://foo.bar"}`
 * (Also stores the session UUID along with the resolve function)
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
