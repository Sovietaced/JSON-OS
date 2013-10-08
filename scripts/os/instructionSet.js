/* ----------------- *
 *   instructionSet.js   *
 *
 *
 * ----------------- */

var _OpCodes = {
    'A9': { args: 2, funct: loadWithConstant },
    'AD': { args: 4, funct: loadFromMemory },
    '8D': { args: 4, funct: loadWithConstant },
    '6D': { args: 4, funct: loadWithConstant },
    'A2': { args: 2, funct: loadWithConstant },
    'AE': { args: 4, funct: loadWithConstant },
    'A0': { args: 2, funct: loadWithConstant },
    'AC': { args: 4, funct: loadWithConstant },
    'EA': { args: 0, funct: loadWithConstant },
    '00': { args: 0, funct: loadWithConstant },
    'EC': { args: 4, funct: loadWithConstant },
    'D0': { args: 2, funct: loadWithConstant },
    'EE': { args: 4, funct: loadWithConstant },
    'FF': { args: 0, funct: loadWithConstant }
};

var loadWithConstant = function(constant){
    _CPU.Acc = constant;
};

var loadFromMemory = function(PC){
    _CPU.Acc = _RAM.readMemory(PC);
};