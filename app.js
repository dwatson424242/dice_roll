
global.libsodium = require("libsodium")
global.sodium = require("libsodium-wrappers")

global.convertBase = function(value, from_base, to_base) {
  var range = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('');
  var from_range = range.slice(0, from_base);
  var to_range = range.slice(0, to_base);
  
  var dec_value = value.split('').reverse().reduce(function (carry, digit, index) {
    if (from_range.indexOf(digit) === -1) throw new Error('Invalid digit `'+digit+'` for base '+from_base+'.');
    return carry += from_range.indexOf(digit) * (Math.pow(from_base, index));
  }, 0);
  
  var new_value = '';
  while (dec_value > 0) {
    new_value = to_range[dec_value % to_base] + new_value;
    dec_value = (dec_value - (dec_value % to_base)) / to_base;
  }
  return new_value || '0';
}

// Generate a random secret
global.secret = Buffer.from(sodium.to_hex(sodium.randombytes_buf(32)), 'hex');
// global.secret = Buffer.from('204b092810ec86d7e35c9d067702a62ef90bc43a7b598626749914d6a3e033ed', 'hex');
 
// Given a message as a string, return a Buffer containing the 
// nonce (in the first 24 bytes) and the encrypted content. 
global.encrypt = function(message, _secret) {
    // You must use a different nonce for each message you encrypt. 
    var nonce = Buffer.from(sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES));
    var buf = Buffer.from(message);
    return Buffer.concat([nonce, Buffer.from(sodium.crypto_secretbox_easy(buf, nonce, _secret))]);
}
 
// Decrypt takes a Buffer and returns the decrypted message as plain text. 
global.decrypt = function(encryptedBuffer, _secret) {
    var nonce = encryptedBuffer.slice(0, sodium.crypto_box_NONCEBYTES);
    var encryptedMessage = encryptedBuffer.slice(sodium.crypto_box_NONCEBYTES);
    return sodium.crypto_secretbox_open_easy(encryptedMessage, nonce, _secret, 'text');
}

global.pad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


global.chain_dice_rolls = function(_count, _secret) {
	var distribute_evenly = false;
	var totals = _count;

	var rolls = '';
	var used = '';
	for (var j = 0; j < totals; j++) {
			var roll;
			if(distribute_evenly) {
				roll = sodium.randombytes_uniform(6) + 1;
			} else {
				roll = (sodium.randombytes_random() % 6) + 1;
			}
			rolls = rolls + roll.toString();
			used = used + '0';
	};
console.log(rolls + used);
	var encrypted_rolls = encrypt(rolls+used, _secret);

	return sodium.to_hex(encrypted_rolls).toString();
}

global.get_next_dice_roll = function(_encrypted_string, _secret) {
	
	var ret = Array();

	var decrypted_rolls = decrypt(Buffer.from(_encrypted_string, 'hex'), _secret);
	console.log(decrypted_rolls);
	var midway = decrypted_rolls.length / 2;
	var cnt = midway;


	var used = decrypted_rolls.charAt(cnt++);
	while(used > 0) {
		used = decrypted_rolls.charAt(cnt++);
		if(cnt > decrypted_rolls.length) {
			// This may need to simply return [false, _encrypted_string]
			_encrypted_string = chain_dice_rolls(midway, _secret)
			return get_next_dice_roll(_encrypted_string, _secret);
		}
	}
	
	ret.push(decrypted_rolls.charAt((cnt-1) - midway));
	decrypted_rolls = decrypted_rolls.slice(0, cnt-1) + '1' + decrypted_rolls.slice(cnt, decrypted_rolls.length)

	var encrypted_rolls = encrypt(decrypted_rolls, _secret);
	ret.push(sodium.to_hex(encrypted_rolls).toString());
	return ret;

}
// var rolls = get_dice_rolls(4, '6c649a74b0a6909d98ad45d3dc883abe723a959c883d1cb15f972240b125b73b1e4bef1d6bc703ab1ef7f298cfec6b9068e60594b2274c433af8cea886ceaad800cc4854301773f229ba756719d3c8f8', secret)

global.get_dice_roll_by_position = function(_position, _encrypted_string, _secret) {

	var ret = Array();

	var decrypted_rolls = decrypt(Buffer.from(_encrypted_string, 'hex'), _secret);
	console.log(decrypted_rolls);
	var midway = decrypted_rolls.length / 2;
	var cnt = midway;
	_position = +_position + +cnt;

	var used = decrypted_rolls.charAt(_position);

	if(used > 0 || _position >= decrypted_rolls.length) { 
		return [false, _encrypted_string]; 
	}
	
	ret.push(decrypted_rolls.charAt(_position - midway));
	decrypted_rolls = decrypted_rolls.slice(0, _position) + '1' + decrypted_rolls.slice(_position+1, decrypted_rolls.length)
console.log(decrypted_rolls);

	var encrypted_rolls = encrypt(decrypted_rolls, _secret);
	ret.push(sodium.to_hex(encrypted_rolls).toString());
	return ret;

}


require('repl').start({})

