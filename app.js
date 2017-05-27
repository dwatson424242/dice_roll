global.argv = process.argv[2];
if(global.argv == 'cli') {
  console.log("Entering CLI Mode...");
}

//global.libsodium = require("libsodium") // Not Needed.
global.sodium = require("libsodium-wrappers")
global.inquirer = require("inquirer")


global.dice_roll = require('./includes/dice_roll.js');

global.secret = dice_roll.generate_secret();



global.runcli = function() {

	// Making a CLI for interaction with the functions:
	inquirer.prompt([
		{type: 'list', name: 'action', message: "\n --- Choose an Option --- \n", choices:['Generate Random Numbers', 'Roll Dice', 'Roll By Position', 'Exit']},
		]).then(function(answer) {
			// console.log(answer);
			switch(answer.action) {
				case 'Generate Random Numbers':
					global.rolls = dice_roll.chain_dice_rolls(20, secret);
					console.log(rolls);
					global.runcli();
				break;
				case 'Roll Dice':
					[roll, rolls] = dice_roll.get_next_dice_roll(global.rolls, secret);
					console.log(roll);
					global.runcli();
				break;
				case 'Roll By Position':

					inquirer.prompt({
					    type: 'input',
					    name: 'position',
					    message: "Enter your position from 0..19: ",
						validate: function (value) {
						      var pass = value.match(/^[0-9].*$/i);
						      if (pass && value >= 0 && value < 20) {
						        return true;
						      }
						      return 'Please enter a number from 0 - 19';
						    }
					  }).then(function(answer2) {
					  	[roll, rolls] = dice_roll.get_dice_roll_by_position(answer2.position, global.rolls, secret);
					  	console.log(roll);
						global.runcli();
					  });

				case 'Exit':
					console.log('done');
				break;

			}
		}
	);

}

if(global.argv == 'cli') {
	global.runcli();
} else {
	console.log("Open tests.js for examples.\nTo run CLI mode, type:\n\t.exit\n\tnode app.js cli\n");
	require('repl').start({})

}



