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
      this.clock = 0;       // Clock ticks to evaluate when switching is necessary
      this.readyQueue = new Queue();
    };

    // Returns the head of the PCB
    this.getRunningProcess = function(){
      return this.readyQueue.peek();
    };

    // Loads the state of the head PCB after switching
    this.loadProcess = function(){
      if(this.readyQueue.getSize() > 0){
        this.readyQueue.peek().loadState();
      }
    }

    this.schedule = function(pcb){

      this.readyQueue.enqueue(pcb);

      // If this is the first process set it up so it can begin executing
      if(this.readyQueue.getSize() === 1){
        this.loadProcess();
        _CPU.isExecuting = true;
      }

      krnTrace("Process " + pcb.getPid() + " scheduled.");
    };

    this.run = function(){
        if (this.readyQueue.getSize() > 0){
          // Switch processes if we've reached the quantum value, increment clock ticks counter
          if(++this.clock % this.quantum === 0 && this.readyQueue.getSize() > 1){
            _KernelInterruptQueue.enqueue(new Interrupt(SCHEDULER_IRQ, new Array("switch"))); 
          }
        }
        else{
          krnTrace("Scheduler has nothing to schedule. Stopping Execution");
          // We have nothing left to process
         _CPU.isExecuting = false;
        }
    };

    // Load next in round robin 
    this.rotate = function(){

      // Remove the head
      var pcb = this.readyQueue.dequeue();

      // Capture the CPU state
      pcb.captureState();

      // Add the head to the tail
      this.readyQueue.enqueue(pcb);

      // Load state of new head
      this.loadProcess();

      krnTrace("Scheduler has switched from rocess " + pcb.getPid() + " to process " + this.readyQueue.peek().getPid() + ".");

    };

    this.kill = function() {
      
      // Remove the head
      var process = this.readyQueue.dequeue();
      krnTrace("Scheduler has killed process " + process.getPid());

      // Try to load the newhead
      this.loadProcess();

    };

    this.setQuantum = function(quantum){
      this.quantum = quantum;
    };

    this.updateDisplay = function(){

    };

}
