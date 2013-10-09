/* ----------------- *
 *   instructionSet.js   *
 *
 *
 * ----------------- */

var OP_CODES = {
    'A9': { args: 2, funct: loadAccWithConstant },
    'AD': { args: 4, funct: loadAccFromMemory },
    '8D': { args: 4, funct: storeAccInMemory },
    '6D': { args: 4, funct: addWithCarry },
    'A2': { args: 2, funct: loadXregWithConstant },
    'AE': { args: 4, funct: loadXregFromMemory },
    'A0': { args: 2, funct: loadYregWithConstant },
    'AC': { args: 4, funct: loadYregFromMemory },
    'EA': { args: 0, funct: noOp },
    '00': { args: 0, funct: brk },
    'EC': { args: 4, funct: compare },
    'D0': { args: 2, funct: branch },
    'EE': { args: 4, funct: increment },
    'FF': { args: 0, funct: system }
};

function loadAccWithConstant(constant){
    _CPU.Acc = parseInt(constant, 16);
    console.log("Accumulator: " + _CPU.Acc)
}

function loadAccFromMemory(PC){
    _CPU.Acc = _RAM.readMemory(PC);
    console.log("Accumulator: " + _CPU.Acc)
}

function storeAccInMemory(PC){
    _RAM.writeMemory(PC, _CPU.Acc);
    console.log("readin memory " +  _RAM.readMemory(PC));
}

function addWithCarry(PC){
    _CPU.Acc += _RAM.readMemory(PC);
}

function loadXregWithConstant(constant){
    _CPU.Xreg = parseInt(constant, 16);
    console.log("loadin x reg with constant : " + _CPU.Xreg);
}

function loadXregFromMemory(PC){
    _CPU.Xreg = _RAM.readMemory(PC);
}

function loadYregWithConstant(constant){
    _CPU.Yreg = parseInt(constant, 16);
}

function loadYregFromMemory(PC){
    _CPU.Yreg = _RAM.readMemory(PC);
    console.log("mem = " + _RAM.readMemory(PC));
    console.log("loadin y reg from mem : " + _CPU.Yreg);
}

function noOp(){
    //wot
}

function brk(){
    //wot
}

function compare(PC){
    var value = _RAM.readMemory(PC);
    if (value == _CPU.Xreg){
        _CPU.Zflag = true;
    }
}

function branch(numBytes){
    if( _CPU.Zflag == 0){
        _CPU.PC += parseInt(numBytes, 16);
    }
}

function increment(PC){
    // Get value and parse as integer
    var value = parseInt(_RAM.readMemory(PC), 16);

    console.log("before increment " + _RAM.readMemory(PC));
    // Increment value 
    value++;
    // Parse value as hex string and write back to memory
    _RAM.writeMemory(PC, value.toString(16));

    console.log("after increment " + _RAM.readMemory(PC));
}

function system(){
    console.log("sysm call, x reg = " + parseInt(_CPU.Xreg, 10));
    if (_parseInt(_CPU.Xreg, 10) == 1){
        _StdIn.putText("Y register: " + parseInt(_CPU.Yreg, 16));
    }
    if (_parseInt(_CPU.Xreg, 10) == 2){
        _StdIn.putText("Y register: " + _CPU.Yreg.toString(16));
    }
}