/* ------------  
   memoryManager.js

   Requires global.js.
   
   ------------ */

function MemoryManager() {

    this.init = function(){
        
    };

    // Allocates instructions to bytes in memory
    this.allocate = function(program){
    	for(var i = 0; i < program.length; i++){
    		// Try to write instructions to memory
	    	if(!_RAM.writeMemory(_CPU.PC, program[i])){
	    		return false;
	    	}
	    	else{
	    		// Increment program counter if everything is fine
	    		_CPU.PC++;
	    	}
		}
		// debugging
		_RAM.dumpMemory();
		return true;
    };
    
}
