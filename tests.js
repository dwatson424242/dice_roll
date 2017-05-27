
secret;
// Generate a new random secret
global.secret = Buffer.from(sodium.to_hex(sodium.randombytes_buf(32)), 'hex');

var secret_message = dice_roll.encrypt("This is a secret message", secret);

var decoded = dice_roll.decrypt(secret_message, secret);
console.log(decoded);



sodium.to_hex(sodium.randombytes_buf(1))
// '8c' (RANDOM)

// How to convert the base from Hex (16) to base 6
dice_roll.convertBase(sodium.to_hex(sodium.randombytes_buf(3)), 16, 6);

// Outputs the same random numbers based on a seed.
var j = sodium.randombytes_buf_deterministic(3, secret)
j
var j = sodium.randombytes_buf_deterministic(3, secret)
j

// Generate a random number from 0..5
sodium.randombytes_uniform(6);

// Generate 20 random numbers and return encrypted
var rolls = dice_roll.chain_dice_rolls(20, secret)

// get the rolls each in order
[roll, rolls] = dice_roll.get_next_dice_roll(rolls, secret);

// The dice roll
roll;

[roll, rolls] = dice_roll.get_dice_roll_by_position(3, rolls, secret);
[roll, rolls] = dice_roll.get_dice_roll_by_position(7, rolls, secret);
[roll, rolls] = dice_roll.get_dice_roll_by_position(0, rolls, secret);
[roll, rolls] = dice_roll.get_dice_roll_by_position(5, rolls, secret);
[roll, rolls] = dice_roll.get_dice_roll_by_position(10, rolls, secret);
