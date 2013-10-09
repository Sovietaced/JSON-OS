/* ------------  
   CPU.js

   Requires global.js.
   
   Routines for the host CPU simulation, NOT for the OS itself.  
   In this manner, it's A LITTLE BIT like a hypervisor,
   in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
   that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
   JavaScript in both the host and client environments.

   This code references page numbers in the text book: 
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
          console.log("stopped");
          _RAM.dumpMemory();
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
      console.log(this.PC);
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
    }
}
