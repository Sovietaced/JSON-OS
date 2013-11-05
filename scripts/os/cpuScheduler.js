/* ------------  
   cpuScheduler.js

   Requires global.js.
   
   ------------ */

function CpuScheduler() {

  this.quantum = 6;     // Quantum value in clock ticks
  this.clock = 0;
  this.readyQueue = new Queue();

    this.init = function(){
      this.quantum = 6;     // Quantum value in clock ticks
      this.clock = 0;
      this.readyQueue = new Queue();
    };

    this.schedule = function(pcb){
      this.readyQueue.enqueue(pcb);

      // Start the CPU if it is not already started
      if(this.readyQueue.getSize() === 1){
        console.log("turnin the cpu on");
        _CPU.isExecuting = true;
      }

      console.log("Process " + pcb.getPid() + " scheduled.");
    };

    this.run = function(){

      // Handle finished program
      if (!_CPU.isExecuting){
        console.log("we here now");
        this.readyQueue.dequeue();
      }
      
      if (this.readyQueue.getSize() > 0){

          // Make sure we're executing
          _CPU.isExecuting = true;

          // Only rotate if we have more than 1 process running
          if(++this.clock % this.quantum === 0 && this.readyQueue.getSize() > 1){
            this.rotate();
          }

          // Get the head
          var pcb = this.readyQueue.peek();
          // Let the kernel know what process we're currently running
          if(_runningProcess != pcb){
            _runningProcess = pcb;
            this.loadPCB(pcb);
          }
          // Process hasn't changed so carry on
          else{

          }
        }
        else{
         _runningProcess = null;
          console.log("WE STOPPING!");
        }


    };

    // Rotate the queue so that the head is moved to the back (Round Robin)
    this.rotate = function(){
      
      // Remove the head
      var pcb = this.readyQueue.dequeue();
      // Capture the CPU state
      pcb.captureState();
      // Add the head to the tail
      this.readyQueue.enqueue(pcb);

      console.log("Just switched processes");

    };

    this.loadPCB = function(pcb){
      // This loads PCB state into CPU
      pcb.loadState();
    };

    this.updateDisplay = function(){

    };
}
