// Items, Tasks, Jobs, Projects
var inquirer = require("inquirer");
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    // Your username
    user: "root",
    // Your password
    password: "MySQL5125496",
    database: "great_bay"
});

startPrompt();

function startPrompt() {
    inquirer.prompt([{
        name: 'command',
        type: 'list',
        message: 'Would you like to Bid on an item or Post a new item?',
        choices: [{
            name: 'bid'
        }, {
            name: 'post'
        }]
    }]).then(function (answer) {
        if (answer.command === 'bid') {
            bidItem();
        } else if (answer.command === 'post') {
            addItem();
        }
    });
}

function addItem() {
    inquirer.prompt([{
        name: 'name',
        message: 'What is the new item?',
        type: 'input'
    }, {
        name: 'price',
        message: 'What is price of the item?',
        type: 'input',
        validate: function (input) {
            if (typeof (parseFloat(input)) === 'number') {
                return true;
            } else {
                console.log("Please enter a number");
            }
        }
    }]).then(function (answer) {
        connection.query("INSERT INTO items SET ?", {
            name: answer.name,
            price: parseFloat(answer.price),
            highest_bid: parseFloat(answer.price)
        }, function (err, res) {
            if (err) throw err;
            console.log("The item was posted on Great_Bay");
            startPrompt();
        });
    });
}

function bidItem() {
    var promise = new Promise(function (resolve, reject) {
        connection.query("SELECT * FROM items", function (err, res) {
            if (err) reject(err);
            var itemArray = res;
            // var bids = itemArray[anser.maxWasRight].highest_bid; 
            resolve(itemArray);
        });
    });
    promise.then(function (itemArray) {
        inquirer.prompt([{
            type: 'list',
            name: 'maxWasRight',
            choices: itemArray.map(function (item) {
                var retItem = {};
                retItem.name = item.name;
                retItem.value = itemArray.indexOf(item);
                return retItem;
            }),
            message: 'Please select an item'
        }]).then(function (answer) {
            console.log("MAX: " + answer.maxWasRight);
            var price = itemArray[answer.maxWasRight].price;
            var nameOfItem = itemArray[answer.maxWasRight].name;
            var highestBidOfItem = itemArray[answer.maxWasRight].highest_bid;
            console.log('Starting price: $' + price + ' | ' + 'Highest current bid: $' + highestBidOfItem);
            // console.log('Currently, the highest bid is: ' + retItem.bid);
            inquirer.prompt([{
                type: 'input',
                name: 'bid',
                message: 'How much is your bid?'
            }]).then(function (answer) {
                console.log(answer.bid);
                if (answer.bid > highestBidOfItem) {
                    connection.query("UPDATE items SET ? WHERE ?", [{
                        highest_bid: answer.bid
                    }, {
                        name: nameOfItem
                    }], function (err, res) {});
                    console.log('Your bid of $' + answer.bid + ' is the highest bid!');
                } else {
                    console.log('You didn\'t bid high enough!');
                    startPrompt();
                }
            });
        });
    });
}