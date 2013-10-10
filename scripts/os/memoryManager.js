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
		return true;
    };

  // Nice help that does base conversions
  this.readValue = function(PC){
    return parseInt(_RAM.readMemory(parseInt(PC, 16)), 16);
  };

   // Nice help that does base conversions
  this.readMemory = function(PC){
    return _RAM.readMemory(PC);
  };

  // Nice help that does base conversions
  this.writeValue = function(PC, value){
    _RAM.writeMemory(parseInt(PC, 16), value.toString(16));
  };
  
  // Updates external display
  this.updateDisplay = function(){

      // Get the memory state
      var memory = _RAM.memory;

      // Convert the memory array to a matrix, with memory address numbas
      var matrixMemory = listToMatrix(memory, 8);

      // Remove table body rows
      $("#memory").empty(); 

      // Render HTML and push it
      for (var row in matrixMemory) {
        var data = "";
         for (var value in matrixMemory[row]){
            data += "<td> " + matrixMemory[row][value] + "</td>";
         }
         $('#memory').append('<tr>' + data + '</tr>');
      }
  }; 
}
