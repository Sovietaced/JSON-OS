/* ------------  
   memoryManager.js

   Requires global.js.
   
   ------------ */

function MemoryManager() {

    this.partitions = {};

    // Generate partitions
    this.init = function(){

      var partitionSize = RAM_SIZE/NUM_PARTITIONS;
      for(var i = 0; i < NUM_PARTITIONS; i++){
        // Create hashes for each partition that hold some basic info
        this.partitions[i] = {pid: null, 
                              low: partitionSize * i,
                              high: partitionSize * (i+1)};
      }
        
    };

    // Allocates instructions to bytes in memory
    this.allocate = function(program, pid){

      var partition = this.findFreePartition(pid); 

      if (partition){
        var memoryPosition = partition.low; // Used to iterate

      	for(var i = 0; i < program.length; i+=2){
      		// Try to write two hex values to each memory byte,
  	    	if(!_RAM.writeMemory(memoryPosition, program[i] + program[i+1])){
            //TODO: Should probably throw an exception here
  	    	
  	    	}
  	    	else{
            // Memory write successful, increment the memory position (PC)
            this.updateDisplay();
            memoryPosition++;
  	    	}
  		  }
        return partition;
      }
    };

  // Finds a free partition for a new process
  this.findFreePartition = function(pid){
    // Loop through the partitions and find one without a PID assigned
    for (var i = 0; i < NUM_PARTITIONS; i++){
      if(this.partitions[i].pid === null){
        // Mark this partition as taken by the PID
        this.partitions[i].pid = pid;
        return this.partitions[i];
      }
    }
  };

  // Helper for allocating virtual memory
this.allocateVirtualMemory = function(program, pid){
  
  // Create the file
  var fileName = "pid" + pid;
  var result = krnCreateFile(fileName, program);

  // Get the TSB of the file and return it
  if (result){
      var tsb = findFile(fileName);
      return tsb;
  }
};

// Helper for writing memory to disk
this.readVirtualMemory = function(pid){
  
  // Create the file
  var fileName = "pid" + pid;
  return krnReadFile(fileName);
};

// Helper for removing virtual memory
this.clearVirtualMemory = function(pid){

  var fileName = "pid" + pid;

  krnDeleteFile(fileName);
};



this.swap = function(pcbwToMem){

  // Get the memory values before we overwrite them
  var index = this.getRandomPartitionIndex();
  var pid = this.partitions[index].pid;
  var program = this.readPartition(index);
    this.debug();

  // Make this partition available for values from HDD
  this.clearPartition(index);

  this.debug();

  var toMempid = pcbwToMem.pcb.getPid();
  var program = this.readVirtualMemory(toMempid);

  // Free up the space we were using previously
  this.clearVirtualMemory(toMempid);

  // Write the program we're going to replace to disk
  var tsb = this.allocateVirtualMemory(program, pid);
  // TODO : HANDLE POSSIBLE ERRORS HERE

  // Give file location to process wrapper, signifying that it is on disk
  var pcbwToHDD = krnFindProcess(pid);
  pcbwToHDD.setTSB(tsb);

  // Write memory values to memory
  var partition = this.allocate(program, toMempid);
  // Update the pcb's location in memory
  pcbwToMem.pcb.setMemoryBounds(partition.low, RAM_SIZE/NUM_PARTITIONS);

  // Set TSB to null snce we are no longer relying on HDD
  pcbwToMem.setTSB(null);

  this.debug();
  // Return the updated process blocks
  return [pcbwToMem, pcbwToHDD]
};

  // Self explanatory
  this.clearMemory = function(base, high){

    for (var i = base; i < high; i++){
      _RAM.writeMemory(i, "00");
    }

    this.updateDisplay();
  }

  // Self explanatory
  this.clearPartition = function(index){
    
      var partition = this.partitions[index];
      this.clearMemory(partition.low, partition.high);
      // Set the partition use to null
      this.partitions[index].pid = null;
  }

  // Helper for swapping
  this.readPartition = function(index){

    var partition = this.partitions[index];
    var values = '';

    for (var i = partition.low; i < partition.high; i++){
      // We don't want to validate the PC here because we may not have a loaded process with bounds yet
      values += _RAM.readMemory(i);
    }

    return values;
  };

  // Returns pid of a random partition in use
  this.getRandomPartitionIndex = function(){

    var partitionsInUse = [];

    for (var i = 0; i < NUM_PARTITIONS; i++){
      var partition = this.partitions[i];
      if(partition.pid !== null){
        partitionsInUse.push(i);
      }
    }
  // Return random element
  return partitionsInUse[Math.floor(Math.random() * partitionsInUse.length)];
  }

  // Parts the partition being used by the specified pid
  this.findPartitionIndex = function(pid){
    for (var i = 0; i < NUM_PARTITIONS; i++){
      var partition = this.partitions[i];
      if(partition.pid === pid){
        return i;
      }
    }
  };

  // Nice help that does base conversions
  this.readValue = function(PC){

      PC = parseInt(PC, 16);
      PC = this.validate(PC + _CpuScheduler.getRunningProcess().pcb.getBase());

      if (PC !== false){
        return parseInt(_RAM.readMemory(PC), 16);
      }

  };

   // Reads direct value, mostly to read instructions
  this.readMemory = function(PC){

    PC = this.validate(PC);
 
    if (PC !== false){
      return _RAM.readMemory(PC);
    }
  };

  // Nice help that does base conversions
  this.writeValue = function(PC, value){

    PC = parseInt(PC, 16);
    PC = this.validate(PC + _CpuScheduler.getRunningProcess().pcb.getBase());

    if (PC !== false){
        // Hack fix to store single digits as 00
        if (value.toString().length){
          value = "0" + value.toString();
        }
      _RAM.writeMemory(PC, value.toString(16));
    }
  };
  
  // Validates memory requests for errors
  this.validate = function(PC){

    // Get PCB limits
    if(_CpuScheduler.getRunningProcess() != null){
      var low = _CpuScheduler.getRunningProcess().pcb.getBase();
      var high = low + _CpuScheduler.getRunningProcess().pcb.getOffset();

      // Validate relative bounds and return absolute location
      if(PC >= low && PC < high){
        return PC;
      }
      else {
         krnTrace("Memory out of bounds exception. Killing the process.");
        _KernelInterruptQueue.enqueue(new Interrupt(MEMORY_OUT_OF_BOUNDS_IRQ)); 
      }
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
