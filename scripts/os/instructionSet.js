/* ----------------- *
 *   instructionSet.js   *
 *
 *
 * ----------------- */

var _OpCodes = {
    'A9': { args: 2, funct: loadAccWithConstant },
    'AD': { args: 4, funct: loadAccFromMemory },
    '8D': { args: 4, funct: storeAccInMemory },
    '6D': { args: 4, funct: addWithCarry },
    'A2': { args: 2, funct: loadXregWithConstant },
    'AE': { args: 4, funct: loadXregFromMemory },
    'A0': { args: 2, funct: loadYregWithContant },
    'AC': { args: 4, funct: loadYregFromMemory },
    'EA': { args: 0, funct: noOp },
    '00': { args: 0, funct: brk },
    'EC': { args: 4, funct: compare },
    'D0': { args: 2, funct: branch },
    'EE': { args: 4, funct: increment },
    'FF': { args: 0, funct: system }
};

function loadAccWithConstant(constant){
    _CPU.Acc = constant;
}

function loadAccFromMemory(PC){
    _CPU.Acc = _RAM.readMemory(PC);
}

function storeAccInMemory(PC){
    _CPU.Acc = _RAM.readMemory(PC);
}

function addWithCarry(PC){
    //herp
}

function loadXregWithConstant(constant){
    _CPU.Xreg = constant;
}

function loadXregFromMemory(PC){
    _CPU.Xreg = _RAM.readMemory(PC);
}

function loadYregWithConstant(constant){
    _CPU.Yreg = constant;
}

function loadYregFromMemory(PC){
    _CPU.Yreg = _RAM.readMemory(PC);
}

function noOp(){
    //wot
}

function brk(){
    _//wot
}

function compare(PC){
    var value = _RAM.readMemory(PC);
    if (value == _CPU.Xreg){
        _CPU.Zflag = true;
    }
}

function branch(numBytes){
    if( _CPU.Zflag == 0){
        _CPU.PC += numBytes;
    }
}

function system(){
    //derp
}