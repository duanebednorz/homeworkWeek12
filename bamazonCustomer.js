// ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'bluePEN456'
var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "bluePEN456",
    database: "bamazonDB"
});

// function to connect to the bamazon database
connection.connect(function (err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
});

// display all of the items available for sale. Include the ids, names, and prices of products for sale.
var printTable = function () {
    connection.query('SELECT * FROM products', function (err, res) {
        console.log("");
        console.log("----------------------------------------------------");
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | $" + res[i].price + " | " + res[i].stock_qty);
        }
        console.log("----------------------------------------------------");
        questions();
    });
};
printTable();


// ask/prompt them the ID of the product they would like to buy.
function questions() {
    inquirer.prompt([
        {
            name: "id",
            type: "input",
            message: "Please select which item you wish to purchase."
        }, {
            // ask/prompt how many units of the product they would like to buy.
            name: "quantity",
            type: "input",
            message: "How many would you like?"


        }]).then(function (answers) {

            // Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.
            // If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.

            productNumber = answers.id
            itemQty = answers.quantity;

            connection.query('SELECT * FROM products WHERE ?', { item_id: productNumber }, function (err, data) {
                if (err) throw err;

                var item = data[0];

                console.log(answers.qty);
                console.log(item);

                // However, if your store does have enough of the product, you should fulfill the customer's order.
                // This means updating the SQL database to reflect the remaining quantity.
                // Once the update goes through, show the customer the total cost of their purchase.
                connection.query('SELECT item_id, product_name, price, stock_qty FROM products WHERE item_id= ' + productNumber,
                    function (err, res) {
                        if (err) throw err;
                        if (res[0].stock_qty < itemQty) {
                            console.log("We\'re sorry, but we do not have that stock level at this time. Please select amount less than " + res[0].stock_qty);
                            questions();
                        } else {
                            connection.query("UPDATE products SET ? WHERE ?",
                                [{ stock_qty: res[0].stock_qty - itemQty }, { item_id: productNumber }],
                                function (err, result) { });
                            if (itemQty === '1') {
                                console.log("Total: $" + (res[0].price * itemQty) + " for your purchase of " + itemQty + " " + res[0].product_name);
                            } else {
                                console.log("Total: $" + (res[0].price * itemQty) + " for your purchase of " + itemQty + " " + res[0].product_name);
                            }
                            console.log("Inventory has been updated.");
                            printTable();
                        }
                    });
            });
        });
}
// Once the update goes through, show the customer the total cost of their purchase.





