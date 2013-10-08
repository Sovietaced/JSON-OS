/* ------------  
   memoryManager.js

   Requires global.js.
   
   ------------ */

function MemoryManager() {

    this.init = function(){
        
    };

    this.allocate = function(program){
    	for(var i = 0; i < program.length; i++){
	    	if(!_RAM.writeMemory(_CPU.PC, program[i])){
	    		return false;
	    	}
		}
		return true;
    };
    
}
