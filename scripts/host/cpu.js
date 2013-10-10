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
      var instructionData = null;
      var arguments = null;

      console.log("INSTRUCTION STRING : " + instruction);
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

    this.fetch = function(){
      return _RAM.readMemory(this.PC++);
    };
    
    this.readArguments = function(length){
      var args = "";

      for(var i = length - 1; i >= 0; i--){
        // Get two bytes at a time, starting from the right
        args += _RAM.readMemory(this.PC + i);
      }

      this.PC += length;

      console.log("args " + args);
      return args;
    };

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
    _CPU.Acc = parseInt(constant, 16);
    console.log("Accumulator: " + _CPU.Acc)
}

function loadAccFromMemory(PC){
    _CPU.Acc = _memoryManager.readValue(PC);
    console.log("Accumulator: " + _CPU.Acc)
}

function storeAccInMemory(PC){
    _memoryManager.writeValue(PC, _CPU.Acc);
    console.log("readin memory " +  _memoryManager.readValue(PC));
}

function addWithCarry(PC){
    _CPU.Acc += _memoryManager.readValue(PC);
}

function loadXregWithConstant(constant){
  console.log("constant " + constant);
    _CPU.Xreg = parseInt(constant, 16);
    console.log("loaded x reg with constant : " + _CPU.Xreg);
}

function loadXregFromMemory(PC){
    _CPU.Xreg = _memoryManager.readValue(PC);
}

function loadYregWithConstant(constant){
    _CPU.Yreg = parseInt(constant, 16);
}

function loadYregFromMemory(PC){
    _CPU.Yreg = _memoryManager.readValue(PC);
    console.log("mem = " + _memoryManager.readValue(PC));
    console.log("loaded y reg from mem : " + _CPU.Yreg);
}

function noOp(){
    // NO operation
}

function brk(){
   // Find the running program
   var process = krnFindProcess(_runningProcess);
   if (process){
    process.captureState();
    _CPU.isExecuting = false;
   }
}

function compare(PC){
  console.log("PC " + PC)
    console.log("compare - value of x reg : " + _CPU.Xreg);
    var value = _memoryManager.readValue(PC);
    console.log("compare - value of memory : " + _memoryManager.readValue(PC));
    if (value == _CPU.Xreg){
        _CPU.Zflag = 1;
        console.log("Z flag set");
    }
    else{
       _CPU.Zflag = 0;
       console.log("Z flag not set");
    }
}

function branch(PC){
    if( _CPU.Zflag == 0){
        _CPU.PC += parseInt(PC, 16);
        if (_CPU.PC >= 256) {
          // Memory out of bounds, should loop back over
          _CPU.PC -= 256;
        }
        console.log("PC AFTER " + _CPU.PC);
    }
}

function increment(PC){
    // Get value and parse as integer
    var value = _memoryManager.readValue(PC);

    console.log("before increment " + value);
    // Increment value 
    value++;
    // Parse value as hex string and write back to memory
   _memoryManager.writeValue(PC, value);

    console.log("after increment " + _memoryManager.readValue(PC));
}

function system(){
   _KernelInterruptQueue.enqueue(new Interrupt(SYS_OPCODE_IRQ));

  }
}