// Requires global.sodium = require("libsodium-wrappers")

class DiceRoll {


    generate_secret() {
        return Buffer.from(sodium.to_hex(sodium.randombytes_buf(32)), 'hex');
    }

    encrypt(message, _secret) {
        // You must use a different nonce for each message you encrypt. 
        var nonce = Buffer.from(sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES));
        var buf = Buffer.from(message);
        return Buffer.concat([nonce, Buffer.from(sodium.crypto_secretbox_easy(buf, nonce, _secret))]);
    }

    // Decrypt takes a Buffer and returns the decrypted message as plain text. 
    decrypt(encryptedBuffer, _secret) {
        var nonce = encryptedBuffer.slice(0, sodium.crypto_box_NONCEBYTES);
        var encryptedMessage = encryptedBuffer.slice(sodium.crypto_box_NONCEBYTES);
        return sodium.crypto_secretbox_open_easy(encryptedMessage, nonce, _secret, 'text');
    }

    chain_dice_rolls(_count, _secret) {
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
        var encrypted_rolls = this.encrypt(rolls+used, _secret);

        return sodium.to_hex(encrypted_rolls).toString();
    }

    get_next_dice_roll(_encrypted_string, _secret) {
    
        var ret = Array();

        var decrypted_rolls = this.decrypt(Buffer.from(_encrypted_string, 'hex'), _secret);
        var midway = decrypted_rolls.length / 2;
        var cnt = midway;


        var used = decrypted_rolls.charAt(cnt++);
        while(used > 0) {
            used = decrypted_rolls.charAt(cnt++);
            if(cnt > decrypted_rolls.length) {
                return [false, _encrypted_string]; 
                
                /* When we run out of rolls, this can rebuild the string.
                // Commented out for now.
                _encrypted_string = chain_dice_rolls(midway, _secret)
                return get_next_dice_roll(_encrypted_string, _secret);
                */
            }
        }

        ret.push(decrypted_rolls.charAt((cnt-1) - midway));
        decrypted_rolls = decrypted_rolls.slice(0, cnt-1) + '1' + decrypted_rolls.slice(cnt, decrypted_rolls.length)
        console.log(decrypted_rolls);

        var encrypted_rolls = this.encrypt(decrypted_rolls, _secret);
        ret.push(sodium.to_hex(encrypted_rolls).toString());
        return ret;

    }
    // var rolls = get_dice_rolls(4, '6c649a74b0a6909d98ad45d3dc883abe723a959c883d1cb15f972240b125b73b1e4bef1d6bc703ab1ef7f298cfec6b9068e60594b2274c433af8cea886ceaad800cc4854301773f229ba756719d3c8f8', secret)

    get_dice_roll_by_position(_position, _encrypted_string, _secret) {

        var ret = Array();

        var decrypted_rolls = this.decrypt(Buffer.from(_encrypted_string, 'hex'), _secret);
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

        var encrypted_rolls = this.encrypt(decrypted_rolls, _secret);
        ret.push(sodium.to_hex(encrypted_rolls).toString());
        return ret;

    }




    // /////////////////  Helper Funcitons //////////////////////// //
    // Converts from one base to another
    convertBase(value, from_base, to_base) {
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

    // Pads a string
    pad(n, width, z) {
      z = z || '0';
      n = n + '';
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

}


module.exports = new DiceRoll();

