/* ------------  
   memoryManager.js

   Requires global.js.
   
   ------------ */

function MemoryManager() {

    this.init = function(){
        
    };

    // Allocates instructions to bytes in memory
    this.allocate = function(program){
    	for(var i = 0; i < program.length; i+=2){
    		// Try to write two hex values to each memory byte,
    		//TODO fix this so that we don't use I, we should use the CPB's bounds
	    	if(!_RAM.writeMemory(_CPU.PC, program[i] + program[i+1])){
	    		return false;
	    	}
	    	else{
	    		_CPU.PC++;
	    	}
		}
		// debugging
		_RAM.dumpMemory();
		return true;
    };
    
}
