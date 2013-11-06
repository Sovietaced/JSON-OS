/* ------------  
   memoryManager.js

   Requires global.js.
   
   ------------ */

function MemoryManager() {

    this.init = function(){
        
    };

    // Allocates instructions to bytes in memory
    this.allocate = function(program){

      var memoryBase = this.findFreeMemory(); // Used to return
      var memoryPosition = memoryBase; // Used to iterate

    	for(var i = 0; i < program.length; i+=2){
    		// Try to write two hex values to each memory byte,
	    	if(!_RAM.writeMemory(memoryPosition, program[i] + program[i+1])){
          //TODO: Should probably throw an exception here
	    		return memoryBase;
	    	}
	    	else{
          // Memory write successful, increment the memory position (PC)
          this.updateDisplay();
          memoryPosition++;
	    	}
		  }
      return memoryBase;
    };

  // Finds free memory for a new process
  this.findFreeMemory = function(){

    var numProcesses = _Processes.length;
    var freeMemoryLocation = 0; // Default to 0

     if (numProcesses > 0){
        var process = _Processes[numProcesses - 1];
        // Next memory location is right after the last known process at this time
        // Not that advanced but it should work for now
        freeMemoryLocation = process.getBase() + process.getOffset();
     }
     return freeMemoryLocation;
  };

  // Self explanatory
  this.clearMemory = function(base, offset){

    for (var i = base; i < base + offset; i++){
      _RAM.writeMemory(i, "00");
    }

    this.updateDisplay();
  }

  // Nice help that does base conversions
  this.readValue = function(PC){
      PC = parseInt(PC, 16);

      if (this.validate(PC)){
        return parseInt(_RAM.readMemory(PC, 16));
      }

  };

   // Reads direct value
  this.readMemory = function(PC){
    if (this.validate(PC)){
      return _RAM.readMemory(PC);
    }
  };

  // Nice help that does base conversions
  this.writeValue = function(PC, value){
    PC = parseInt(PC, 16);

    if (this.validate(PC)){
      _RAM.writeMemory(PC, value.toString(16));
    }
  };
  
  // Validates memory requests for errors
  this.validate = function(PC){

    // Get PCB limits
    var low = _runningProcess.getBase();
    var high = low + _runningProcess.getOffset();

    if(PC >= low && PC < high){
      return true;
    }
    else {

    console.log("low " + low);
    console.log("high " + high);
    console.log("PC " + PC);
      krnTrapError("Memory Acces Out Of Bounds");
    }
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
