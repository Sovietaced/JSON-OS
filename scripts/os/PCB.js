/* ------------  
   processControlBlock.js

   Requires global.js.
   
   ------------ */

function PCB() {

	var Acc = null;
	var Xreg = null;
	var Yreg = null;
    var pid = null;
    var PC = 0;
	var base = 0;
	var offset = 0;              
    
    
    this.init = function(pid, offset){
		this.Acc = null;
		this.Xreg = null;
		this.Yreg = null;
	    this.pid = pid;
	    this.PC = 0;
		this.base = 0;
		this.offset = offset;  
    };

    this.getPid = function(){
    	return this.pid;
    };

    this.run = function(){
    	var instructionString = "";
    	var instruction = null;
    	var arguments = null;

    	while(this.PC < (this.base + this.offset)){
    		instructionString = this.readInstruction();
    		if (instructionString in OP_CODES){
    			// Get the instruction value in the opcodes dictionary
    			instruction = OP_CODES[instructionString];
    			// Determine the arguments based on the instruction's expected arguments
    			arguments = this.readArguments(instruction.args);
    			// Execute the instruction
    			var funct = instruction.funct;
    			funct(arguments);
    		}
    		else{
    			console.log("fail");
    		}
    	}
        _StdIn.advanceLine();
        _StdIn.putText("Done.");
    };

    this.readInstruction = function(){
    	return _RAM.readMemory(this.PC++) + _RAM.readMemory(this.PC++);
    };
    
    this.readArguments = function(length){
    	var args = "";
    	for(var i = length/2 - 1; i >= 0; i--){
            // Get two bytes at a time, starting from the right
    		  args += _RAM.readMemory(this.PC + (i * 2) ) + _RAM.readMemory(this.PC + (i * 2 + 1));
        }
        this.PC += length;

        console.log("args " + args);
    	return args;
    }
}
