console.log('starting password manager');

var storage = require('node-persist');
var crypto = require('crypto-js');
storage.initSync();

var argv = require('yargs')
  .command('create', 'store username and password', function (yargs) {
    yargs.options({
      name: {
        demand: true,
        alias: 'n',
        description: 'Name goes here',
        type: 'string'
      },
      username: {
        demand: true,
        alias: 'u',
        description: 'Username goes here',
        type: 'string'
      },
      password: {
        demand: true,
        alias: 'p',
        description: 'Password goes here',
        type: 'string'
      },
      masterPassword: {
        demand: true,
        alias: 'm',
        description: 'Master password here',
        type: 'string',
      }
    }).help('help')
  })
  .command('get', 'retrieve username and password for name', function(yargs) {
    yargs.options({
      name: {
        demand: true,
        alias: 'n',
        description: 'retrieve user and pass for this name',
        type: 'string',
      },
      masterPassword: {
        demand: true,
        alias: 'm',
        description: 'Master password here',
        type: 'string',
      }
    })
  })
  .help('help')
  .argv;
var command = argv._[0];

// storage.setItemSync('accounts', [{
//   username: 'Andrew',
//   balance: 0
// }]);
// var accounts = storage.getItemSync('accounts');
// accounts.push({
//   username: 'Kenton',
//   balance: 10,
// })
// storage.setItemSync('accounts', accounts);
// console.log('Save accounts is: ', accounts);

// account.name Facebook
// account.username User12!
// account.password Password123!

function getAccounts(masterPassword) {
  // getItemSync to fetch accs
  var encryptedAccounts = storage.getItemSync('accounts');
  var decryptedAccounts = [];

  // decrypt
  if (typeof encryptedAccounts !== 'undefined') {
    var bytes = crypto.AES.decrypt(encryptedAccounts, masterPassword);
    decryptedAccounts = JSON.parse(bytes.toString(crypto.enc.Utf8));
  }

  // return accounts array
  return decryptedAccounts;
}

function saveAccounts(accounts, masterPassword) {
  // encrypt accounts
  var encryptedAccounts = crypto.AES.encrypt(JSON.stringify(accounts), masterPassword);;
  // setItemSync
  storage.setItemSync('accounts', encryptedAccounts.toString());
  return accounts;
}

function createAccount(account, masterPassword) {
  var accounts = getAccounts(masterPassword);
  accounts.push(account);
  // storage.setItemSync('accounts', accounts);
  saveAccounts(accounts, masterPassword);
  return account;
}

function getAccount(accountName, masterPassword) {
  var accounts = getAccounts(masterPassword);

  for(var i = 0; i < accounts.length; i++) {
    if(accounts[i].name === accountName) {
      return accounts[i];
    }
  }
  return undefined;
}

// createAccount({
//   name: 'Facebook',
//   username: 'username',
//   password: 'aiya123',
// })

if (command === 'create') {
  try {
    var newAcc = createAccount({
    name: argv.name,
    username: argv.username,
    password: argv.password
    }, argv.masterPassword)
    console.log('Account created!');
    console.log(newAcc);
  } catch(e) {
    console.log('Unable to create account.');
  }
} else if (command === 'get') {
  try {
    var fetchedAccount = getAccount(argv.name, argv.masterPassword);
    if (typeof fetchedAccount === 'undefined') {
      console.log('Account not found');
    } else {
      console.log('Account found');
      console.log(fetchedAccount);
    }
  } catch(e) {
    console.log('Unable to retrieve account.');
  }
}