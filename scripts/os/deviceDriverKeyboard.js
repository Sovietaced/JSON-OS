/* ----------------------------------
   DeviceDriverKeyboard.js
   
   Requires deviceDriver.js
   
   The Kernel Keyboard Device Driver.
   ---------------------------------- */

DeviceDriverKeyboard.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.
 //These are special cases that don't fit the ASCII mapping
var exceptions = {
    186: 59, // ;
    187: 61, // =
    188: 44, // ,
    189: 45, // -
    190: 46, // .
    191: 47, // /
    192: 96, // `
    219: 91, // [
    220: 92, // \
    221: 93, // ]
    222: 39  // '
}

var special = {
    1: '!',
    2: '@',
    3: '#',
    4: '$',
    5: '%',
    6: '^',
    7: '&',
    8: '*',
    9: '(',
    0: ')',
    ',': '<',
    '.': '>',
    '/': '?',
    ';': ':',
    "'": '"',
    '[': '{',
    ']': '}',
    '\\': '|',
    '`': '~',
    '-': '_',
    '=': '+'
};

function DeviceDriverKeyboard()                     // Add or override specific attributes and method pointers.
{
    // "subclass"-specific attributes.
    // this.buffer = "";    // TODO: Do we need this?
    // Override the base method pointers.
    this.driverEntry = krnKbdDriverEntry;
    this.isr = krnKbdDispatchKeyPress;
    // "Constructor" code.
}

function krnKbdDriverEntry()
{
    // Initialization routine for this, the kernel-mode Keyboard Device Driver.
    this.status = "loaded";
    // More?
}

function krnKbdDispatchKeyPress(params)
{
    // Parse the params.    TODO: Check that they are valid and osTrapError if not.
    var keyCode = params[0];
    var isShifted = params[1];
    krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
    var chr = "";

    // Check to see if we even want to deal with the key that was pressed.
    if ( ((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
         ((keyCode >= 97) && (keyCode <= 123)) )   // a..z
    {
        // Determine the character we want to display.  
        // Assume it's lowercase...
        chr = String.fromCharCode(keyCode + 32);
        // ... then check the shift key and re-adjust if necessary.
        if (isShifted)
        {
            chr = String.fromCharCode(keyCode);
        }
        // TODO: Check for caps-lock and handle as shifted if so.
        _KernelInputQueue.enqueue(chr);        
    }    
    else if ( ((keyCode >= 48) && (keyCode <= 57)) ||   // digits 
               (keyCode == 32)                     ||   // space
               (keyCode == 13)                     ||   // enter
               (keyCode == 8)                      ||   // backspace
               (keyCode == 38)                     ||   // up arrow
               (keyCode == 40))                        // down arrow
              {
        chr = String.fromCharCode(keyCode);
        _KernelInputQueue.enqueue(chr); 
    }
    else if (keyCode in exceptions)
    {
        chr = String.fromCharCode(exceptions[keyCode]);
        if(isShifted){
          chr = special[chr];
        }
        _KernelInputQueue.enqueue(chr); 
    }
    // Throw errors - currently thrown for shift and caps lock will fix soon
    else 
    {
      //krnTrapError("Invalid key code");
    }
}
