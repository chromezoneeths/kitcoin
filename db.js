// This file contains abstractions for database calls. It should do any injection filtering.
// const sqllib = require('@mysql/xdevapi');
const MongoClient = require('mongodb').MongoClient
const conf = require('./config')
const uuid = require('uuid/v4');
var client
exports.init = () => {
  return new Promise(async (r, rj) => {
    console.log("RECORDS, LOGGING: Connecting to database at " + conf.dbIP);
    client = new MongoClient(conf.dbIP, {useNewUrlParser:true})
    try {
      await client.connect();
      console.log("RECORDS, LOGGING: Connection successful, ensuring everything is ready");
      const db = client.db('kitcoin');
      await Promise.all([
        db.createCollection("users", {
          'validator': { '$or':[
            { 'uuid': { '$type':'string' } },
            { 'address': { '$regex':/[A-Za-z0-9]*\@[A-Za-z0-9]*\.[a-z]*/ } },
            { 'name': { '$type':'string' } },
            { 'role': { '$in':['student','teacher','vendor','admin','sadmin'] } }
          ]}
        }),
        db.createCollection("transactions", {
          'validator': { '$or':[
            { 'uuid': { '$type':'string' } },
            { 'timestamp': { '$type':'date' } },
            { 'sender': { '$type':'string' } },
            { 'recipient': { '$type':'string' } },
            { 'amount': { '$type':'int' } }
          ]}
        }),
        db.createCollection("products", {
          'validator': { '$or':[
            { 'uuid': { '$type':'string' } },
            { 'vendor': { '$type':'string' } },
            { 'name': { '$type':'string' } },
            { 'description': { '$type':'string' } },
            { 'price': { '$type':'int' } }
          ]}
        })
      ])
      console.log("RECORDS, LOGGING: All collections have been created.");
    } catch (err) {
      console.log("RECORDS, PROBLEM: Connection failed, printing error and exiting.");
      console.log(err);
      console.log(err.stack);
      process.exit(1) // Can't connect to database to set things up; there's no need to stay alive
    }
  })
}
exports.addUser = (id, address, name) => {
  return new Promise(async (r) => {
    await client.connect()
    const db = client.db('kitcoin');
    await db.collection('users').insertOne({
      uuid:id,
      address:address,
      name:name,
      role:'student'
    })
    r()
  })
}
exports.addTransaction = (sender, recipient, amount) => {
  return new Promise(async (r) => {
    await client.connect()
    const db = client.db('kitcoin')
    await db.collection('transactions').insertOne({
      uuid:uuid(),
      timestamp:(new Date(Date.now())).toISOString(),
      sender:sender,
      recipient:recipient,
      amount:amount
    })
    r()
  })
}
exports.getBalance = (uuid) => {
  return new Promise(async (r) => {
    var balance = 0
    await client.connect()
    const db = client.db('kitcoin')
    const transactions = db.collection('transactions')
    const rec = await transactions.find({recipient:uuid})
    const out = await transactions.find({sender:uuid})
    await Promise.all([
      new Promise(async r=>{
        while(await rec.hasNext()){
          const doc = await rec.next()
          balance += doc.amount
        }
        r()
      }),
      new Promise(async r=>{
        while(await out.hasNext()){
          const doc = await out.next()
          balance -= doc.amount
        }
        r()
      })
    ])
    r(balance)
  })
}
exports.getUserByAddress = (address) => {
  return new Promise(async (r) => {
    await client.connect()
    const db = client.db('kitcoin')
    const users = db.collection('users')
    const search = await users.find({address:address})
    if(await search.hasNext()){
      r(await search.next())
    } else {
      r()
    }
  })
}
exports.getUserByID = (uuid) => {
  return new Promise(async (r) => {
    await client.connect()
    const db = client.db('kitcoin')
    const users = db.collection('users')
    const search = await users.find({uuid})
    if(await search.hasNext()){
      r(await search.next())
    } else {
      r()
    }
  })
}
exports.listUsers = () => {
  return new Promise(async (r) => {
    await client.connect()
    var results = []
    const db = client.db('kitcoin')
    const users = db.collection('users')
    const search = await users.find({})
    while (await search.hasNext()){
      results.push(await search.next())
    }
    r(results)
  })
}
exports.listTransactions = () => {
  return new Promise(async (r) => {
    await client.connect()
    var results = []
    const db = client.db('kitcoin')
    const transactions = db.collection('transactions')
    const search = await transactions.find({})
    while (await search.hasNext()){
      results.push(await search.next())
    }
    r(results)
  })
}
exports.grant = (id, permission) => {
  return new Promise(async (r, rj) => {
    if (!['admin', 'teacher', 'vendor'].includes(permission)) rj("Invalid permission")
    await client.connect()
    const db = client.db('kitcoin')
    const users = db.collection('users')
    await users.findOneAndUpdate({uuid:id},{$set:{role:permission}})
    r()
  })
}
exports.degrant = (id, permission) => {
  return new Promise(async (r, rj) => {
    await client.connect()
    const db = client.db('kitcoin')
    const users = db.collection('users')
    await users.findOneAndUpdate({uuid:id},{$set:{role:'student'}})
    r()
  })
}
exports.exec = (statement) => {
  return new Promise(async (r, rj) => {
    rj("RECORDS, WARNING: Arbitrary SQL call run on non-SQL Kitcoin variant.")
  })
}
