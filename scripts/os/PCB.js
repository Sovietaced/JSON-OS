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
    		console.log(instructionString);
    		console.log(_OpCodes);
    		if (instructionString in _OpCodes){
    			// Get the instruction value in the opcodes dictionary
    			instruction = _OpCodes[instructionString];
    			// Determine the arguments based on the instruction's expected arguments
    			arguments = this.readArguments(instruction.args);
    			// Execute the instruction
    			console.log(instruction);
    			var funct = instruction.funct;
    			console.log(funct);
    			funct(arguments);

    			//debugging
    			console.log("Accumulator: " + _CPU.Acc);
    		}
    		else{
    			console.log("fail");
    		}
    	}
    };

    this.readInstruction = function(){
    	console.log("readin");
    	return _RAM.readMemory(this.PC++) + _RAM.readMemory(this.PC++);
    };
    
    this.readArguments = function(length){
    	var args = "";
    	for(var i = 0; i < length; i++){
    		args += _RAM.readMemory(this.PC++);
    	}
    	return args;
    }
}
