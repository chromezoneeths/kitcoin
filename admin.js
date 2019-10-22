const db = require('./db');
// This file contains definitions for the rpc actions.
exports.handle = (message, ws) => {
  return new Promise(async (r, rj) => {
    switch (message.procedure) {
      case "listUsers": { // Lists users; ignores body.
        var usersQuery = await db.listUsers()
        ws.send(JSON.stringify({
          action: 'elevateResult',
          status: "ok",
          contents: usersQuery
        }))
        break;
      }
      case "listTransactions": { // Lists transactions; treats body as limit, if possible.
        var transactions = await db.listTransactions()
        var limit
        try {
          limit = parseInt(message.body, 10)
        } catch (e) {
          limit = 50
        }
        transactions = transactions.slice(-limit)
        ws.send(JSON.stringify({
          action: 'elevateResult',
          status: 'ok',
          contents: transactions
        }))
        break;
      }
      case "grant": { // Treats body as a the user's e-mail or uuid, followed by the permission to grant, separated by a space.
        var userAddress = message.body.split(" ")[0]
        var permission = message.body.split(" ")[1]
        await db.grant(userAddress, permission).catch(re => {
          rj(re)
        })
        ws.send(JSON.stringify({
          action: 'elevateResult',
          status: 'ok'
        }))
        r()
        break;
      }
      case "degrant": { // Treats body as a the user's e-mail or uuid, followed by the permission to degrant, separated by a space.
        var userAddress = message.body.split(" ")[0]
        var permission = message.body.split(" ")[1]
        await db.degrant(userAddress, permission).catch(rj)
        ws.send(JSON.stringify({
          action: 'elevateResult',
          status: 'ok'
        }))
        r()
        break;
      }
      case "sql": { // Treats body as a SQL statement to be executed. Handle with care.
        ws.send(JSON.stringify({
          action: 'elevateResult',
          status: 'failed',
          contents: 'This is the MongoDB port of Kitcoin, you can\'t do that here.'
        }))
        break;
      }
      default: {
        ws.send(JSON.stringify({
          action: 'elevateResult',
          status: 'badProcedure'
        }))
      }
    }
  })
}
