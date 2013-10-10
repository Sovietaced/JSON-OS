/* ------------  
   CPU.js

   Requires global.js.
   
   Routines for the host CPU simulation, NOT for the OS itself.  
   In _CPU manner, it's A LITTLE BIT like a hypervisor,
   in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
   that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
   JavaScript in both the host and client environments.

   _CPU code references page numbers in the text book: 
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

function Cpu() {
    this.PC    = 0;     // Program Counter
    this.Acc   = 0;     // Accumulator
    this.Xreg  = 0;     // X register
    this.Yreg  = 0;     // Y register
    this.Zflag = 0;     // Z-ero flag (Think of it as "isZero".)
    this.isExecuting = false;
    
    this.init = function() {
        this.PC    = 0;
        this.Acc   = 0;
        this.Xreg  = 0;
        this.Yreg  = 0;
        this.Zflag = 0;      
        this.isExecuting = false;  
    };
    
    this.cycle = function() {
        krnTrace("CPU cycle");
        // TODO: Accumulate CPU usage and profiling statistics here.
        if(this.execute(this.fetch()) == false){
          this.isExecuting = false;
        }
    };

    this.execute = function(instruction){
      var instructionData = null; // The hash from OP_CODES
      var arguments = null;

      // Check for valid instruction
      if (instruction in OP_CODES){
        // Get the instruction value in the opcodes dictionary
        instructionData = OP_CODES[instruction];
        // Determine the arguments based on the instruction's expected arguments
        arguments = this.readArguments(instructionData.argsLen);
        // Execute the instruction
        instructionData.funct(arguments);
        return true;
      }
      else{
       return false;
      }
    };

    // Fetches the instruction at the PC
    this.fetch = function(){
      return _memoryManager.readMemory(this.PC++);
    };
    
    // Fetches the arguments for the previous instruction, normally 1 or 2 bytes at a time
    this.readArguments = function(length){
      var args = "";

      for(var i = length - 1; i >= 0; i--){
        // Get two bytes at a time, starting from the right
        args += _memoryManager.readMemory(this.PC + i);
      }

      // Increment the PC for how many bytes we took
      this.PC += length;

      return args;
    };

    // Updates browser display
    this.updateDisplay = function(){
      $('#PC').html(this.PC);
      $('#Acc').html(this.Acc);
      $('#Xreg').html(this.Xreg);
      $('#Yreg').html(this.Yreg);
      $('#Zflag').html(this.Zflag);
    };

// Pretty self explanatory
var OP_CODES = {
    'A9': { argsLen: 1, funct: loadAccWithConstant },
    'AD': { argsLen: 2, funct: loadAccFromMemory },
    '8D': { argsLen: 2, funct: storeAccInMemory },
    '6D': { argsLen: 2, funct: addWithCarry },
    'A2': { argsLen: 1, funct: loadXregWithConstant },
    'AE': { argsLen: 2, funct: loadXregFromMemory },
    'A0': { argsLen: 1, funct: loadYregWithConstant },
    'AC': { argsLen: 2, funct: loadYregFromMemory },
    'EA': { argsLen: 0, funct: noOp },
    '00': { argsLen: 0, funct: brk },
    'EC': { argsLen: 2, funct: compare },
    'D0': { argsLen: 1, funct: branch },
    'EE': { argsLen: 2, funct: increment },
    'FF': { argsLen: 0, funct: system }
};

function loadAccWithConstant(constant){
    _CPU.Acc = hexToInt(constant);
}

function loadAccFromMemory(PC){
    _CPU.Acc = _memoryManager.readValue(PC);
}

function storeAccInMemory(PC){
    _memoryManager.writeValue(PC, _CPU.Acc);
}

function addWithCarry(PC){
    _CPU.Acc += _memoryManager.readValue(PC);
}

function loadXregWithConstant(constant){
    _CPU.Xreg = hexToInt(constant);
}

function loadXregFromMemory(PC){
    _CPU.Xreg = _memoryManager.readValue(PC);
}

function loadYregWithConstant(constant){
    _CPU.Yreg = hexToInt(constant);
}

function loadYregFromMemory(PC){
    _CPU.Yreg = _memoryManager.readValue(PC);
}

function noOp(){
    // NO operation
}

function brk(){
   // Find the running program
   var process = krnFindProcess(_runningProcess);
   // If found stop it.
   if (process){
    process.captureState();
    _CPU.isExecuting = false;
   }
}

function compare(PC){
    var value = _memoryManager.readValue(PC);
    if (value == _CPU.Xreg){
        _CPU.Zflag = 1;
    }
    else{
       _CPU.Zflag = 0;
    }
}

function branch(position){
    if( _CPU.Zflag == 0){
      // Increment PC number of positions
        _CPU.PC += hexToInt(position);
        if (_CPU.PC >= 256) {
          // Memory out of bounds, no bueno
          _CPU.PC -= 256;
        }
    }
}

function increment(PC){
    // Get value and parse as integer
    var value = _memoryManager.readValue(PC);
    // Increment value 
    value++;
    // Write incremented value to memory
   _memoryManager.writeValue(PC, value);
}

function system(){
    // Spawn Interrupt
   _KernelInterruptQueue.enqueue(new Interrupt(SYS_OPCODE_IRQ));
  }
}